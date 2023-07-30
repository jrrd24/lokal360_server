const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");
const Notification = require("./Notification");

class UserNotification extends Model {}

UserNotification.init(
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
    sequelize,
    modelName: "UserNotification",
    tableName: "user_notification",
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
