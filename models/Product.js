const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Category = require("./Category");
const ShopCategory = require("./ShopCategory");
const Shop = require("./Shop");
const Promo = require("./Promo");

const Product = sequelize.define(
  "Product",
  {
    productID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shopCategoryID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    product_name: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
    },
    archived_at: {
      type: DataTypes.DATE,
    },
    total_sold: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "product",
    modelName: "Product",
    timestamps: true,
    paranoid: true,
  }
);
Product.belongsTo(Category, { foreignKey: "categoryID", onDelete: "CASCADE" });
Category.hasMany(Product, { foreignKey: "categoryID" });

Product.belongsTo(ShopCategory, {
  foreignKey: "shopCategoryID",
  onDelete: "CASCADE",
});
ShopCategory.hasMany(Product, { foreignKey: "shopCategoryID" });

Product.belongsTo(Shop, { foreignKey: "shopID", onDelete: "CASCADE" });
Shop.hasMany(Product, { foreignKey: "shopID" });

Product.belongsTo(Promo, { foreignKey: "promoID", onDelete: "CASCADE" });
Promo.hasMany(Product, { foreignKey: "promoID" });

module.exports = Product;
