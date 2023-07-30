const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const ShopOwner = require('./ShopOwner');
const Category = require('./Category');

class ShopRegistration extends Model {}

ShopRegistration.init(
  {
    shopRegistrationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopOwnerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shop_name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    shop_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attatchment_DTI_CBNR: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attatchment_DTI_other: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attatchment_BIR_COR: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attatchment_valid_id: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attatchment_products_list: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(500),
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    resolution_at: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'ShopRegistration',
    tableName: 'shop_registration',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
  }
);

ShopRegistration.belongsTo(ShopOwner, { foreignKey: 'shopOwnerID', onDelete: 'CASCADE' });
ShopOwner.hasMany(ShopRegistration, { foreignKey: 'shopOwnerID' });

ShopRegistration.belongsTo(Category, { foreignKey: 'categoryID', onDelete: 'CASCADE' });
Category.hasMany(ShopRegistration, { foreignKey: 'categoryID' });

module.exports = ShopRegistration;