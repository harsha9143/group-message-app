module.exports = (io, socket) => {
  socket.on("message-room", async (message) => {
    await Message.create({ message, userId: socket.user.id });
    io.emit("message-room", {
      message,
      username: socket.user.name,
      createdAt: new Date(),
    });
  });
};
