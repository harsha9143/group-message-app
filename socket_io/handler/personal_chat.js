const Message = require("../../models/message");

module.exports = (io, socket) => {
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
  });

  socket.on("new-message", async ({ message, roomName }) => {
    await Message.create({ message, userId: socket.user.id, roomName });

    io.to(roomName).emit("new-message", {
      username: socket.user.name,
      message,
      createdAt: new Date(),
      userId: socket.user.id,
    });
  });
};
