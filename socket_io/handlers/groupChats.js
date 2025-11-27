const Message = require("../../models/message");

module.exports = (socket, io) => {
  socket.on("new-message", async (message) => {
    await Message.create({
      message: message.message,
      userId: message.isAction ? null : socket.user.id,
      roomName: message.roomName,
    });
    io.to(message.roomName).emit("new-message", {
      message: message.message,
      name: message.isAction ? null : socket.user.name,
      userId: message.isAction ? null : socket.user.id,
    });
  });
};
