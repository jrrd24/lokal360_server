const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const Voucher = require('./Voucher');
const Product = require('./Product');

class VoucherAppliedProduct extends Model {}

VoucherAppliedProduct.init(
  {
    voucherAppliedProductID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    voucherID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'VoucherAppliedProduct',
    tableName: 'voucher_applied_product',
    timestamps: false,
  }
);

VoucherAppliedProduct.belongsTo(Voucher, { foreignKey: 'voucherID', onDelete: 'CASCADE' });
VoucherAppliedProduct.belongsTo(Product, { foreignKey: 'productID', onDelete: 'CASCADE' });

module.exports = VoucherAppliedProduct;