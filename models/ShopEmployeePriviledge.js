const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const ShopEmployee = require("./ShopEmployee");
const Priviledge = require("./Priviledge");

class ShopEmployeePrivilege extends Model {}

ShopEmployeePrivilege.init(
  {
    shopEmployeePrivilegeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopEmployeeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priviledgeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ShopEmployeePrivilege",
    tableName: "shop_employee_priviledge",
    timestamps: false,
  }
);

ShopEmployee.belongsToMany(Priviledge, {
  through: ShopEmployeePrivilege,
  foreignKey: "shopEmployeeID",
  onDelete: "CASCADE",
});
Priviledge.belongsToMany(ShopEmployee, {
  through: ShopEmployeePrivilege,
  foreignKey: "privilegeID",
  onDelete: "CASCADE",
});

module.exports = ShopEmployeePrivilege;
