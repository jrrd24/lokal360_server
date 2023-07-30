const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const Shop = require('./Shop');

class Promo extends Model {}

Promo.init(
  {
    promoID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    promo_type: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    min_spend: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Promo',
    tableName: 'promo',
    timestamps: true,
  }
);

Promo.belongsTo(Shop, { foreignKey: 'shopID', onDelete: 'CASCADE' });
Shop.hasMany(Promo, { foreignKey: 'shopID' });

module.exports = Promo;
