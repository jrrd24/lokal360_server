const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const Shop = require('./Shop');

class ShopCategory extends Model {}

ShopCategory.init(
  {
    shopCategoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ShopCategory',
    tableName: 'shop_category',
    timestamps: true,
  }
);

ShopCategory.belongsTo(Shop, { foreignKey: 'shopID', onDelete: 'CASCADE' });
Shop.hasMany(ShopCategory, { foreignKey: 'shopID' });

module.exports = ShopCategory;