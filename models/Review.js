import { DataTypes, Model } from "sequelize";
import sequelize from "../config/sequelize";
import Shopper from "./Shopper";
import Product from "./Product";

class Review extends Model {}

Review.init(
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
    productID: {
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
    attatchment_image: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "review",
    timestamps: "true",
    updatedAt: false,
  }
);

Review.belongsTo(Shopper, { foreignKey: "shopperID", onDelete: "CASCADE" });
Shopper.hasMany(Review, { foreignKey: "shopperID" });

Review.belongsTo(Product, { foreignKey: "productID", onDelete: "CASCADE" });
Product.hasMany(Review, { foreignKey: "productID" });

export default Review;
