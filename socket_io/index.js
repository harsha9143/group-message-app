const { Server } = require("socket.io");

const socketAuth = require("./middleware");
const chat = require("./handler/chat");
const personal_chat = require("./handler/personal_chat");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:4000",
    },
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    chat(io, socket);
    personal_chat(io, socket);
  });

  return io;
};
