const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const Shopper = require('./Shopper');

class DeliveryAddress extends Model {}

DeliveryAddress.init(
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
    city: {
      type: DataTypes.STRING(100),
    },
    country: {
      type: DataTypes.STRING(50),
    },
    district: {
      type: DataTypes.STRING(50),
    },
    iso_country_code: {
      type: DataTypes.STRING(3),
    },
    postal_code: {
      type: DataTypes.CHAR(4),
    },
    region: {
      type: DataTypes.STRING(50),
    },
    street: {
      type: DataTypes.STRING(50),
    },
    street_no: {
      type: DataTypes.INTEGER,
    },

  },
  {
    sequelize,
    modelName: 'DeliveryAddress',
    tableName: 'delivery_address',
    timestamps: true,
  }
);

DeliveryAddress.belongsTo(Shopper, { foreignKey: 'shopperID', onDelete: 'CASCADE' });
Shopper.hasMany(DeliveryAddress, { foreignKey: 'shopperID' });

module.exports = DeliveryAddress;
