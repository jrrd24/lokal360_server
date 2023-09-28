const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shopper = require("./Shopper");
const Product = require("./Product");

const Review = sequelize.define(
  "Review",
  {
    reviewID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopperID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productVariationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    review_content: {
      type: DataTypes.STRING(500),
    },
    attachment_image: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "review",
    modelName: "Review",
    timestamps: true,
    updatedAt: false,
  }
);

Review.belongsTo(Shopper, { foreignKey: "shopperID", onDelete: "CASCADE" });
Shopper.hasMany(Review, { foreignKey: "shopperID" });

Review.belongsTo(Product, { foreignKey: "productID", onDelete: "CASCADE" });
Product.hasMany(Review, { foreignKey: "productID" });

module.exports = Review;
