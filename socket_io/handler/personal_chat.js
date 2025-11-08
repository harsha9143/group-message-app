module.exports = (io, socket) => {
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
  });

  socket.on("new-message", ({ message, roomName }) => {
    io.to(roomName).emit("new-message", {
      username: socket.user.username,
      message,
    });
  });

  socket.on("new-message", async (message) => {
    await Message.create({ message, userId: socket.user.id });
    io.emit("new-message", {
      message,
      username: socket.user.name,
      createdAt: new Date(),
    });
  });
};
