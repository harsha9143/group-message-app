const Group = require("../../models/group");
const Message = require("../../models/message");
const User = require("../../models/user");

module.exports = (socket, io) => {
  socket.on("leave-group", async (object) => {
    const group = await Group.findByPk(object.groupId);
    const members = JSON.parse(group.members) || [];
    const updatedMembers = members.filter(
      (m) => m.toString() !== object.id.toString()
    );
    group.members = JSON.stringify(updatedMembers);
    await group.save();

    const user = await User.findByPk(object.id);
    const userGroups = JSON.parse(user.groups) || [];
    const updatedgroups = userGroups.filter(
      (m) => m.toString() !== object.groupId.toString()
    );
    user.groups = JSON.stringify(updatedgroups);
    await user.save();

    await Message.create({
      message: `${object.name} has left the group`,
      userId: null,
      roomName: group.roomName,
    });

    io.to(object.roomName).emit("leave-group", {
      removedId: object.id,
      message: `${object.name} has left the group`,
      roomId: group.id,
    });
  });
};
