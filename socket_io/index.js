const { Server } = require("socket.io");

const socketAuth = require("./middleware");
const chat = require("./handler/chat");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4000",
    },
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    chat(io, socket);
  });

  return io;
};
