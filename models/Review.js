const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shopper = require("./Shopper");
const Product = require("./Product");
const ProductVariation = require("./ProductVariation");

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
    prodVariationID: {
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
    paranoid: true,
  }
);

Review.belongsTo(Shopper, { foreignKey: "shopperID", onDelete: "CASCADE" });
Shopper.hasMany(Review, { foreignKey: "shopperID" });

Review.belongsTo(ProductVariation, {
  foreignKey: "prodVariationID",
  onDelete: "CASCADE",
});
ProductVariation.hasMany(Review, { foreignKey: "prodVariationID" });

module.exports = Review;
