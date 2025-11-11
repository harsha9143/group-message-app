module.exports = (io, socket) => {
  socket.on("new-media", async ({ mediaUrl, roomName }) => {
    await Message.create({
      message: mediaUrl,
      userId: socket.user.id,
      roomName,
    });

    io.to(roomName).emit("new-message", {
      username: socket.user.name,
      mediaUrl,
      createdAt: new Date(),
      userId: socket.user.id,
    });
  });
};
