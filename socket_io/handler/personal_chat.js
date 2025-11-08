module.exports = (io, socket) => {
  socket.on("join-room", (roomName) => {
    socket.join(roomName);
  });

  socket.on("new-message", ({ message, roomName }) => {
    io.emit("message-room", { username: socket.user.username, message });
  });

  socket.on("message-room", async (message) => {
    await Message.create({ message, userId: socket.user.id });
    io.emit("message-room", {
      message,
      username: socket.user.name,
      createdAt: new Date(),
    });
  });
};
