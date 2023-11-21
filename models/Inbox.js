const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

const Inbox = sequelize.define(
  "Inbox",
  {
    inboxID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // last_msg: {
    //   type: DataTypes.STRING(100),
    // },
    // is_seen: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    // },
    // is_deleted: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    // },
    // unseen_msg_counter: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
  },
  {
    tableName: "inbox",
    modelName: "Inbox",
    timestamps: true,
    paranoid: true,
  }
);

//TODO: fix relationship
Inbox.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasMany(Inbox, { foreignKey: "userID" });
Inbox.belongsTo(User, { foreignKey: "senderID", onDelete: "CASCADE" });
User.hasMany(Inbox, { foreignKey: "senderID" });

module.exports = Inbox;
