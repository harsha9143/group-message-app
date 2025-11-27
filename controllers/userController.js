const path = require("path");

const { v4 } = require("uuid");
const { Op } = require("sequelize");
const AWS = require("aws-sdk");

const Message = require("../models/message");
const User = require("../models/user");
const Group = require("../models/group");
const PersonalChat = require("../models/PersonalChat");
const { smartReplies, predictNextWord } = require("../services/genAiService");

exports.accountPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "chatWindow.html"));
};

exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
  }
};

exports.getOldMessages = async (req, res) => {
  try {
    const roomName = req.query.roomName;

    const oldMessages = await Message.findAll({
      where: {
        roomName,
      },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
    });

    if (!oldMessages) {
      return res.status(400);
    }

    res.status(200).json(oldMessages);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

exports.userExists = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).json({ exist: false });
    }

    res.status(200).json({ exist: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error!!!" });
  }
};

exports.createGroupPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "create-group.html"));
};

exports.createGroup = async (req, res) => {
  try {
    const { name, adminId } = req.body;

    let uuid = v4();

    let group_exist = await Group.findOne({
      where: {
        roomName: `${name}_${uuid}`,
      },
    });

    while (group_exist) {
      uuid = v4();
      group_exist = await Group.findOne({
        where: {
          roomName: `${name}_${uuid}`,
        },
      });
    }

    const createGroup = await Group.create({
      name,
      adminId,
      members: JSON.stringify([adminId]),
      roomName: `${name}_${uuid}`,
    });

    console.log(createGroup);

    if (!createGroup) {
      return res
        .status(400)
        .json({ message: "Error while creating group...try again later!" });
    }

    const user = await User.findByPk(adminId);

    const groupsOfUser = JSON.parse(user.groups) || [];
    groupsOfUser.push(createGroup.id);
    user.groups = JSON.stringify(groupsOfUser);
    await user.save();

    res.status(201).json({ message: "Group created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error!!!" });
  }
};

exports.getUserGroups = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const userGroups = JSON.parse(user.groups) || [];

    const reqGroups = await Group.findAll({
      where: {
        id: {
          [Op.in]: userGroups,
        },
      },
    });

    if (!reqGroups) {
      return res.status(400).json({ message: "groups not found" });
    }

    res.status(200).json(reqGroups);
  } catch (error) {
    console.log(error.message);
  }
};

exports.addToGroup = async (req, res) => {
  try {
    const { userEmail, roomId } = req.body;

    const friend = await User.findOne({
      where: {
        email: userEmail,
      },
    });

    if (!friend) {
      return res.status(400).json({ message: "Email not found!!!" });
    }

    const friendGroups = JSON.parse(friend.groups) || [];
    if (friendGroups.includes(roomId)) {
      return res.status(403).json({ message: "User is already in the group" });
    }
    friendGroups.push(roomId);
    friend.groups = JSON.stringify(friendGroups);
    await friend.save();

    const group = await Group.findByPk(roomId);
    const groupMembers = JSON.parse(group.members) || [];
    if (groupMembers.includes(friend.id)) {
      return res.status(403).json({ message: "User is already in the group" });
    }
    groupMembers.push(friend.id);
    group.members = JSON.stringify(groupMembers);
    await group.save();

    res.status(200).json({ message: `${friend.name} was added to the group` });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const groupId = req.query.groupId;

    const groupMembers = await Group.findByPk(groupId, {
      attributes: ["members", "adminId"],
    });

    if (!groupMembers) {
      return res
        .status(400)
        .json({ message: "Group members cannot be fetched" });
    }

    const groupMembersIds = JSON.parse(groupMembers.members) || [];
    const groupMembersList = await User.findAll({
      where: {
        id: {
          [Op.in]: groupMembersIds,
        },
      },
    });

    if (!groupMembersList) {
      return res
        .status(400)
        .json({ message: "Group members cannot be fetched" });
    }
    res.status(200).json({ groupMembersList, adminId: groupMembers.adminId });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.destroyGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const groupDetails = await Group.findByPk(groupId);
    if (!groupDetails) {
      return res
        .status(400)
        .json({ message: "Error While destroying the group" });
    }
    const groupMembers = JSON.parse(groupDetails.members);

    for (let i = 0; i < groupMembers.length; i++) {
      const groupMember = await User.findByPk(groupMembers[i]);
      if (!groupMember) {
        return res
          .status(400)
          .json({ message: "Error While destroying the group" });
      }
      const userGroups = JSON.parse(groupMember.groups);
      const updatedUserGroups = userGroups.filter((g) => g !== groupId);
      groupMember.groups = JSON.stringify(updatedUserGroups);
      await groupMember.save();
    }

    const removeGroupMessages = await Message.destroy({
      where: {
        roomName: groupDetails.roomName,
      },
    });

    if (!removeGroupMessages) {
      return res
        .status(400)
        .json({ message: "Error While destroying the group" });
    }

    await groupDetails.destroy();

    res.status(200).json({ message: "Group Destroyed Successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error " + error.message });
  }
};

exports.isMember = async (req, res) => {
  try {
    const group = await Group.findByPk(req.query.groupId);
    if (!group) {
      return res.status(400).json({ message: "Error fetching group" });
    }
    const groupMembers = JSON.parse(group.members);
    const isExist = groupMembers.includes(req.user.id);
    if (!isExist) {
      return res.status(200).json({ exist: false });
    }

    res.status(200).json({ exist: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.groupExist = async (req, res) => {
  try {
    const group = await Group.findByPk(req.query.groupId);
    if (!group) {
      return res.status(200).json({ exist: false });
    }

    res.status(200).json({ exist: true });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.personalChats = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const userChats = JSON.parse(user.personal_rooms) || [];
    const personalChats = await PersonalChat.findAll({
      where: {
        id: {
          [Op.in]: userChats,
        },
      },
    });

    if (!personalChats) {
      return req.status(400).json({ message: "Error Fetching chats" });
    }

    for (let i = 0; i < personalChats.length; i++) {
      const members = JSON.parse(personalChats[i].members);
      const [friendId] = members.filter((id) => id != req.user.id);
      const otherUser = await User.findByPk(friendId);
      personalChats[i].dataValues.name = otherUser.name;
      personalChats[i].dataValues.isPersonal = true;
    }

    res.status(200).json(personalChats);
  } catch (error) {
    console.log("Error>>>>>>>>>>>>>>>>>", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.chatExist = async (req, res) => {
  try {
    const roomId = req.query.roomId;

    const chat = await PersonalChat.findByPk(roomId);

    if (!chat) {
      return res.status(200).json({ exist: false });
    }

    res.status(200).json({ exist: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server error" });
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const s3bucket = await new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "File not uploaded" });

    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}_${file.originalname}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read",
    };

    const response = await s3bucket.upload(params).promise();
    res.status(201).json({ ok: true, fileUrl: response.Location });
  } catch (error) {
    console.log("upload error>>>>>>>", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.smartReply = async (req, res) => {
  try {
    const { message, tone } = req.body;
    const replies = await smartReplies(message, tone);

    if (!replies) {
      return res.status(400).json({ message: "Error while fetching replies" });
    }

    res.status(200).json({ replies });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.suggestions = async (req, res) => {
  try {
    const { text, tone } = req.body;

    const suggestions = await predictNextWord(text, tone);

    if (!suggestions) {
      return;
    }

    res.status(200).json({ suggestions });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
