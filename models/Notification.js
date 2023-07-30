const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class Notification extends Model {}

Notification.init(
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
    sequelize,
    modelName: "Notification",
    tableName: "notification",
    timestamps: true,
    createdAt: true,
    updatedAt: false,
  }
);

module.exports = Notification;
