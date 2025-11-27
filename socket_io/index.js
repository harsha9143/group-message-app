const { Server } = require("socket.io");

const socketAuth = require("./middleWare");
const groupChats = require("./handlers/groupChats");
const leaveGroup = require("./handlers/leaveGroup");
const removeUser = require("./handlers/removeUser");
const destroyGroup = require("./handlers/destroyGroup");
const PersonalChat = require("../models/PersonalChat");
const User = require("../models/user");
const removePersonalChats = require("./handlers/removePersonalChats");

const socketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
    methods: ["GET", "POST"],
  });

  socketAuth(io);

  io.on("connection", (socket) => {
    socket.on("leave-all-rooms", () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) socket.leave(room);
      });
    });
    socket.on("join-room", async (object) => {
      if (object.isPrivate) {
        const chatRoom = await PersonalChat.findOne({
          where: {
            roomName: object.roomName,
          },
        });
        if (!chatRoom) {
          const user1 = await User.findOne({
            where: {
              email: object.email1,
            },
          });

          const user2 = await User.findOne({
            where: {
              email: object.email2,
            },
          });

          const createRoom = await PersonalChat.create({
            roomName: object.roomName,
            members: JSON.stringify([user1.id, user2.id]),
          });

          const user1Personals = JSON.parse(user1.personal_rooms);
          user1Personals.push(createRoom.id);
          user1.personal_rooms = JSON.stringify(user1Personals);
          await user1.save();

          const user2Personals = JSON.parse(user2.personal_rooms);
          user2Personals.push(createRoom.id);
          user2.personal_rooms = JSON.stringify(user2Personals);
          await user2.save();
        }
      }
      socket.join(object.roomName);
    });
    groupChats(socket, io);
    leaveGroup(socket, io);
    removeUser(socket, io);
    destroyGroup(socket, io);
    removePersonalChats(socket, io);
  });

  return io;
};

module.exports = socketIO;
