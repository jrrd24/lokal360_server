const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Product = require("./Product");

const ProductImage = sequelize.define(
  "ProductImage",
  {
    prodImageID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prod_image: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_thumbnail: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "product_image",
    modelName: "ProductImage",
    timestamps: false,
  }
);

ProductImage.belongsTo(Product, {
  foreignKey: "productID",
  onDelete: "CASCADE",
});
Product.hasMany(ProductImage, { foreignKey: "productID" });
module.exports = ProductImage;
