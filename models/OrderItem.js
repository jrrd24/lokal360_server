const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Order = require("./Order");
const Product = require("./Product");

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
    productVariationID: {
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
    tableName: "order_item",
    modelName: "OrderItem",
    timestamps: false,
  }
);

OrderItem.belongsTo(Order, { foreignKey: "orderID", onDelete: "CASCADE" });
Order.hasMany(OrderItem, { foreignKey: "orderID" });
OrderItem.belongsTo(Product, { foreignKey: "productID", onDelete: "CASCADE" });
Product.hasMany(OrderItem, { foreignKey: "productID" });
