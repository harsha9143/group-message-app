const path = require("path");
const Message = require("../models/message");

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
    const messages = await Message.findAll({
      // where: {
      //   userId: req.user.id,
      // },
      order: [["createdAt", "ASC"]],
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
