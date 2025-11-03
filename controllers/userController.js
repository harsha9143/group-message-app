const Message = require("../models/message");

exports.userAccount = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "chatWindow.html"));
};

exports.storeMessage = async (req, res) => {
  try {
    const sendMessage = await Message.create({
      message: req.body.message,
      userId: "1",
    });

    if (!sendMessage) {
      return res.status(400).json({ message: "Failed to send message" });
    }

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "message not sent" });
  }
};
