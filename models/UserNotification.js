const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");
const Notification = require("./Notification");

const UserNotification = sequelize.define(
  "UserNotification",
  {
    userNotificationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notificationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "user_notification",
    modelName: "UserNotification",
    timestamps: false,
  }
);

User.belongsToMany(Notification, {
  through: UserNotification,
  foreignKey: "userID",
  otherKey: "notificationID",
});
Notification.belongsToMany(User, {
  through: UserNotification,
  foreignKey: "notificationID",
  otherKey: "userID",
});

module.exports = UserNotification;
