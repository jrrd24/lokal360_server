const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shopper = require("./Shopper");

const DeliveryAddress = sequelize.define(
  "DeliveryAddress",
  {
    deliveryAddressID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopperID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    municipality: {
      type: DataTypes.STRING(100),
    },
    country: {
      type: DataTypes.STRING(50),
    },
    postal_code: {
      type: DataTypes.CHAR(4),
    },
    region: {
      type: DataTypes.STRING(100),
    },
    province: {
      type: DataTypes.STRING(100),
    },
    address_line_1: {
      type: DataTypes.STRING(200),
    },
    address_line_2: {
      type: DataTypes.STRING(200),
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
    },
  },
  {
    tableName: "delivery_address",
    modelName: "DeliveryAddress",
    timestamps: true,
  }
);

DeliveryAddress.belongsTo(Shopper, {
  foreignKey: "shopperID",
  onDelete: "CASCADE",
});
Shopper.hasMany(DeliveryAddress, { foreignKey: "shopperID" });

module.exports = DeliveryAddress;
