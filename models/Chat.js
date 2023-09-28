const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

const Chat = sequelize.define(
  "Chat",
  {
    chatID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    meta: {
      type: DataTypes.STRING(255),
    },
    deleted_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "chat",
    timestamps: false,
  }
);

Chat.belongsTo(User, { foreignKey: "senderID", onDelete: "CASCADE" });
User.hasMany(Chat, { foreignKey: "senderID" });

module.exports = Chat;
