const Message = require("../../models/message");
const PersonalChat = require("../../models/PersonalChat");
const User = require("../../models/user");

module.exports = (socket, io) => {
  socket.on("remove-personal-chat", async (object) => {
    const room = await PersonalChat.findByPk(object.id);

    const removeMessages = await Message.destroy({
      where: {
        roomName: room.roomName,
      },
    });

    const roomMembers = JSON.parse(room.members) || [];
    for (let i = 0; i < roomMembers.length; i++) {
      const user = await User.findByPk(roomMembers[i]);
      const userChats = JSON.parse(user.personal_rooms) || [];
      const updatedUserChats = userChats.filter(
        (c) => c.toString() !== room.id.toString()
      );
      user.personal_rooms = JSON.stringify(updatedUserChats);
      await user.save();
    }

    await room.destroy();

    io.to(room.roomName).emit("remove-personal-chat", {
      message: "all chats are deleted",
    });
  });
};
