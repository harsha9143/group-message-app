const { DataTypes } = require("sequelize");
const sequelize = require("../utils/databaseUtil");

const Group = sequelize.define("group_chats", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  members: {
    type: DataTypes.STRING,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = Group;
