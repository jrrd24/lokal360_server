const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shop = require("./Shop");

const ShopCategory = sequelize.define(
  "ShopCategory",
  {
    shopCategoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "shop_category",
    modelName: "ShopCategory",
    timestamps: true,
  }
);

ShopCategory.belongsTo(Shop, { foreignKey: "shopID", onDelete: "CASCADE" });
Shop.hasMany(ShopCategory, { foreignKey: "shopID" });

module.exports = ShopCategory;
