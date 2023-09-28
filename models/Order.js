const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shopper = require("./Shopper");
const DeliveryAddress = require("./DeliveryAddress");
const ShopperClaimedVoucher = require("./ShopperClaimedVoucher");

const Order = sequelize.define(
  "Order",
  {
    orderID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopperID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliveryAddressID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shopperClaimedVoucherID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    shipping_method: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    total_price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    tableName: "order",
    modelName: "Order",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: false,
  }
);

Order.belongsTo(Shopper, { foreignKey: "shopperID", onDelete: "CASCADE" });
Shopper.hasMany(Order, { foreignKey: "shopperID" });

Order.belongsTo(DeliveryAddress, {
  foreignKey: "deliveryAddressID",
  onDelete: "CASCADE",
});
DeliveryAddress.hasMany(Order, { foreignKey: "deliveryAddressID" });

Order.belongsTo(ShopperClaimedVoucher, {
  foreignKey: "shopperClaimedVoucherID",
  onDelete: "CASCADE",
});
ShopperClaimedVoucher.hasOne(Order, { foreignKey: "shopperClaimedVoucherID" });

module.exports = Order;
