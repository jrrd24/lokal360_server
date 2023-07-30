const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Cart = require("./Cart");
const Product = require("./Product");

class CartItem extends Model {}

CartItem.init(
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
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    variation: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "cart_item",
    timestamps: false,
  }
);

CartItem.belongsTo(Cart, { foreignKey: "cartID", onDelete: "CASCADE" });
Cart.hasMany(CartItem, { foreignKey: "cartID" });
CartItem.belongsTo(Product, { foreignKey: "productID", onDelete: "CASCADE" });
Product.hasMany(CartItem, { foreignKey: "productID" });

module.exports = CartItem;
