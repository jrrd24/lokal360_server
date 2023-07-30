const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./User');
const Shop = require('./Shop')

class ShopOwner extends Model {}

ShopOwner.init(
  {
    shopOwnerID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone_num: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'ShopOwner',
    tableName: 'shop_owner',
    timestamps: false,
  }
);

ShopOwner.belongsTo(User, { foreignKey: 'userID', onDelete: 'CASCADE' });
User.hasOne(ShopOwner, {foreignKey:'userID'})


module.exports = ShopOwner;