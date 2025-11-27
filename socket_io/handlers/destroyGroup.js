const Group = require("../../models/group");
const Message = require("../../models/message");
const User = require("../../models/user");

module.exports = (socket, io) => {
  socket.on("destroy-group", async (object) => {
    const group = await Group.findByPk(object.groupId);
    const groupMembers = JSON.parse(group.members) || [];
    const roomName = group.roomName;

    for (let i = 0; i < groupMembers.length; i++) {
      const user = await User.findByPk(groupMembers[i]);
      const userGroups = JSON.parse(user.groups) || [];
      const updatedUserGroups = userGroups.filter(
        (g) => g.toString() !== object.groupId.toString()
      );
      user.groups = JSON.stringify(updatedUserGroups);
      await user.save();
    }
    await group.destroy();

    await Message.destroy({
      where: {
        roomName,
      },
    });

    io.to(roomName).emit("destroy-group", {
      message: `${group.name} group is destroyed by admin`,
      groupId: group.id,
    });
  });
};
