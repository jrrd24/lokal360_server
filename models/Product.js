const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Category = require("./Category");
const ShopCategory = require("./ShopCategory");
const Shop = require("./Shop");
const Promo = require("./Promo");

class Product extends Model {}

Product.init(
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
      allowNull: false,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
    },
    archived_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "product",
    timestamps: true,
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
