const path = require("path");
const AWS = require("aws-sdk");
const Message = require("../models/message");
const User = require("../models/user");
const { predictNextWord, smartReplies } = require("../services/genAiServices");

exports.userAccount = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "chatWindow.html"));
};

exports.getMessages = async (req, res) => {
  try {
    const roomName = req.query.roomName;

    const messages = await Message.findAll({
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

    if (!messages) {
      return res.status(404).json({ message: "Failed to fetch messages" });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: "Server Error!! Failed to fetch messages" });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const userDetails = await User.findByPk(req.user.id);

    if (!userDetails) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(userDetails);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.userExists = async (req, res) => {
  try {
    const otherUser = req.body.email;

    const userExist = await User.findOne({
      where: {
        email: otherUser,
      },
    });

    if (!userExist) {
      return res.status(200).json({ exists: false });
    }

    res.status(200).json({ exists: true });
  } catch (error) {
    console.log("error>>>>>>>>", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadToS3 = async (req, res) => {
  try {
    const s3bucket = await new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

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
    res.status(200).json({ ok: true, fileUrl: response.Location });
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const { text, tone } = req.body;

    const suggestions = await predictNextWord(text, tone);

    if (!suggestions) {
      return;
    }

    res.status(200).json({ suggestions });
  } catch (error) {
    return;
  }
};

exports.getSmartReply = async (req, res) => {
  try {
    const { message, tone } = req.body;
    const smartReply = await smartReplies(message, tone);

    if (!smartReply) {
      return;
    }

    res.status(200).json({ replies: smartReply });
  } catch (error) {
    return;
  }
};
