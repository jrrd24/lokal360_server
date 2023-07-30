const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class VarInventory extends Model {}

VarInventory.init(
  {
    varInventoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    amt_sold: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amt_on_hand: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'VarInventory',
    tableName: 'var_inventory',
    timestamps: false,
  }
);

module.exports = VarInventory;
