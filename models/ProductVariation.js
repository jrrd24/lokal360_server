const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Product = require("./Product");

const ProductVariation = sequelize.define(
  "ProductVariation",
  {
    prodVariationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    var_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    var_image: {
      type: DataTypes.STRING(255),
    },
    amt_sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amt_on_hand: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
  },
  {
    tableName: "product_variation",
    modelName: "ProductVariation",
    timestamps: true,
  }
);

ProductVariation.belongsTo(Product, {
  foreignKey: "productID",
  onDelete: "CASCADE",
});
Product.hasMany(ProductVariation, { foreignKey: "productID" });

module.exports = ProductVariation;
