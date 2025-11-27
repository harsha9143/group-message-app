const { DataTypes } = require("sequelize");
const sequelize = require("../utils/databaseUtil");

const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  personal_rooms: {
    type: DataTypes.TEXT,
  },
  groups: {
    type: DataTypes.TEXT,
  },
});

module.exports = User;
