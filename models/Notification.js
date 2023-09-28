const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Notification = sequelize.define(
  "Notification",
  {
    notificationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
    },
    message: {
      type: DataTypes.STRING(255),
    },
    type: {
      type: DataTypes.STRING(15),
    },
  },
  {
    tableName: "notification",
    modelName: "Notification",
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

module.exports = Notification;
