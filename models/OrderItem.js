const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Order = require("./Order");
const Product = require("./Product");

class OrderItem extends Model {}

OrderItem.init(
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
    modelName: "OrderItem",
    tableName: "order_item",
    timestamps: false,
  }
);

OrderItem.belongsTo(Order, { foreignKey: "orderID", onDelete: "CASCADE" });
Order.hasMany(OrderItem, { foreignKey: "orderID" });OrderItem.belongsTo(Product, { foreignKey: "productID", onDelete: "CASCADE" });
Product.hasMany(OrderItem, { foreignKey: "productID" });
