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
    inboxID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "chat",
    timestamps: true,
    paranoid: false,
  }
);

//TODO: fix relationship

Chat.belongsTo(User, { foreignKey: "senderID", onDelete: "CASCADE" });
User.hasMany(Chat, { foreignKey: "senderID" });

module.exports = Chat;
