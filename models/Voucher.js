const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const Shop = require('./Shop');
const Promo = require('./Promo');

class Voucher extends Model {}

Voucher.init(
  {
    voucherID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Voucher',
    tableName: 'voucher',
    timestamps: true,
  }
);

Voucher.belongsTo(Shop, { foreignKey: 'shopID', onDelete: 'CASCADE' });
Shop.hasMany(Voucher, { foreignKey: 'shopID' });

Voucher.belongsTo(Promo, { foreignKey: 'promoID', onDelete: 'CASCADE' });
Promo.hasMany(Voucher, { foreignKey: 'promoID' });

module.exports = Voucher;