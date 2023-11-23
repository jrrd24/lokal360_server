const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shopper = require("./Shopper");

const Cart = sequelize.define(
  "Cart",
  {
    cartID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopperID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "cart",
    modelName: "Cart",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Cart;

Cart.belongsTo(Shopper, { foreignKey: "shopperID", onDelete: "CASCADE" });
Shopper.hasOne(Cart, { foreignKey: "shopperID" });

module.exports = Cart;
