const Group = require("../../models/group");
const Message = require("../../models/message");
const User = require("../../models/user");

module.exports = (socket, io) => {
  socket.on("removed-user-notify", async (object) => {
    const user = await User.findByPk(object.removedUserId);
    const userGroups = JSON.parse(user.groups);
    const updatedUserGroups = userGroups.filter(
      (g) => g.toString() !== object.roomId.toString()
    );
    user.groups = JSON.stringify(updatedUserGroups);
    await user.save();

    const group = await Group.findByPk(object.roomId);
    const groupMembers = JSON.parse(group.members);
    const updatedGroupMembers = groupMembers.filter(
      (m) => m.toString() !== object.removedUserId.toString()
    );
    group.members = JSON.stringify(updatedGroupMembers);
    await group.save();

    await Message.create({
      message: `${user.name} was removed by admin`,
      userId: null,
      roomName: group.roomName,
    });

    io.to(group.roomName).emit("removed-user-notify", {
      removedId: object.removedUserId,
      message: `${user.name} was removed by admin`,
      roomId: group.id,
      name: group.name,
    });
  });
};
