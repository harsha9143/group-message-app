const { DataTypes } = require("sequelize");

const sequelize = require("../utils/databaseUtil");

const ArchivedMessage = sequelize.define("messages", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
  },
});

module.exports = ArchivedMessage;
