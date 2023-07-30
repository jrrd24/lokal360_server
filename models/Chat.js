const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

class Chat extends Model {}

Chat.init(
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
    sequelize,
    modelName: "Chat",
    tableName: "chat",
    timestamps: false,
  }
);

Chat.belongsTo(User, { foreignKey: "senderID", onDelete: "CASCADE" });
User.hasMany(Chat, { foreignKey: "senderID" });

module.exports = Chat;
