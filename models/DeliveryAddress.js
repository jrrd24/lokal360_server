const { DataTypes, BOOLEAN } = require("sequelize");
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
      allowNull: false,
    },
    barangay: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.CHAR(4),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address_line_1: {
      type: DataTypes.STRING(200),
      allowNull: false,
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "delivery_address",
    modelName: "DeliveryAddress",
    timestamps: true,
    paranoid: true,
  }
);

DeliveryAddress.belongsTo(Shopper, {
  foreignKey: "shopperID",
  onDelete: "CASCADE",
});
Shopper.hasMany(DeliveryAddress, { foreignKey: "shopperID" });

module.exports = DeliveryAddress;
