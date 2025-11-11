const { DataTypes } = require("sequelize");
const sequelize = require("../utils/dbUtil");

const Archieved = sequelize.define("archives", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
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
    allowNull: false,
  },
});

module.exports = Archieved;
