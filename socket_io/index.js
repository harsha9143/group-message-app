const { Server } = require("socket.io");

const socketAuth = require("./middleware");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4000",
    },
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    socket.on("message-room", async (message) => {
      console.log(socket.user);
      await Message.create({ message, userId: socket.user.id });
      io.emit("message-room", {
        message,
        username: socket.user.name,
        createdAt: new Date(),
      });
    });
  });

  return io;
};
