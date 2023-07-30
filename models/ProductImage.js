const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Product = require("./Product");

class ProductImage extends Model {}

ProductImage.init(
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
    sequelize,
    modelName: "ProductImage",
    tableName: "product_image",
    timestamps: false,
  }
);

ProductImage.belongsTo(Product, {
  foreignKey: "productID",
  onDelete: "CASCADE",
});
Product.hasMany(ProductImage, { foreignKey: "productID" });
module.exports = ProductImage;
