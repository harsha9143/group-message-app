const path = require("path");
const Message = require("../models/message");
const User = require("../models/user");

let clients = [];

exports.userAccount = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "chatWindow.html"));
};

// exports.storeMessage = async (req, res1) => {
//   try {
//     const sendMessage = await Message.create({
//       message: req.body.message,
//       userId: req.user.id,
//     });

//     if (!sendMessage) {
//       return res1.status(400).json({ message: "Failed to send message" });
//     }

//     clients.forEach(({ res, timeOut }) => {
//       clearTimeout(timeOut);

//       res.json([req.body.message]);
//     });

//     clients = [];
//     res1.sendStatus(200);
//   } catch (error) {
//     console.log(error.message);
//     res1.status(500).json({ message: "message not sent" });
//   }
// };

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
