const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Cart = require("./Cart");
const Product = require("./Product");
const ProductVariation = require("./ProductVariation");

const CartItem = sequelize.define(
  "CartItem",
  {
    cartItemID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cartID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prodVariationID: {
      type: DataTypes.INTEGER,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "cart_item",
    modelName: "CartItem",
    timestamps: true,
    paranoid: true,
  }
);

CartItem.belongsTo(Cart, { foreignKey: "cartID", onDelete: "CASCADE" });
Cart.hasMany(CartItem, { foreignKey: "cartID" });
CartItem.belongsTo(ProductVariation, {
  foreignKey: "prodVariationID",
  onDelete: "CASCADE",
});
ProductVariation.hasMany(CartItem, { foreignKey: "prodVariationID" });

module.exports = CartItem;
