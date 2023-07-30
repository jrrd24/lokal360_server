const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");
const Shop = require("./Shop");

class ShopEmployee extends Model {}

ShopEmployee.init(
  {
    shopEmployeeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job_title: {
      type: DataTypes.STRING(130),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ShopEmployee",
    tableName: "shop_employee",
    timestamps: false,
  }
);

ShopEmployee.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasOne(ShopEmployee, { foreignKey: "userID" });

ShopEmployee.belongsTo(Shop, { foreignKey: "shopID", onDelete: "CASCADE" });
Shop.hasMany(ShopEmployee, { foreignKey: "shopID" });

module.exports = ShopEmployee;
