const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Order = require("./Order");
const ProductVariation = require("./ProductVariation");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    orderItemID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prodVariationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "order_item",
    modelName: "OrderItem",
    timestamps: false,
  }
);

OrderItem.belongsTo(Order, { foreignKey: "orderID", onDelete: "CASCADE" });
Order.hasMany(OrderItem, { foreignKey: "orderID" });
OrderItem.belongsTo(ProductVariation, {
  foreignKey: "prodVariationID",
  onDelete: "CASCADE",
});
ProductVariation.hasMany(OrderItem, { foreignKey: "prodVariationID" });

module.exports = OrderItem;
