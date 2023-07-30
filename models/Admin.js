const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

class Admin extends Model {}

Admin.init(
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
    sequelize,
    modelName: "Admin",
    tableName: "admin",
    timestamps: false,
  }
);

Admin.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasOne(Admin, { foreignKey: "userID" });

module.exports = Admin;
