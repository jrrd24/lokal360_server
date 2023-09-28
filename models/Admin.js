const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

const Admin = sequelize.define(
  "Admin",
  {
    adminID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    has_admin_privileges: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "admin",
    timestamps: false,
    modelName: "Admin",
  }
);

Admin.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasOne(Admin, { foreignKey: "userID" });

module.exports = Admin;
