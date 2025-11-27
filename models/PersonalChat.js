const { DataTypes } = require("sequelize");
const sequelize = require("../utils/databaseUtil");

const PersonalChat = sequelize.define("personal_chats", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  members: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

module.exports = PersonalChat;
