const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");
const Shop = require("./Shop");

const ShopEmployee = sequelize.define(
  "ShopEmployee",
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
    access_analytics: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    access_products: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    access_customers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    access_orders: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    access_shopInformation: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    access_promos: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    access_lokal_ads: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    access_vouchers: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "shop_employee",
    modelName: "ShopEmployee",
    timestamps: true,
  }
);

ShopEmployee.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasOne(ShopEmployee, { foreignKey: "userID" });

ShopEmployee.belongsTo(Shop, { foreignKey: "shopID", onDelete: "CASCADE" });
Shop.hasMany(ShopEmployee, { foreignKey: "shopID" });

module.exports = ShopEmployee;
