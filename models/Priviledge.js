const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/sequelize');

class Privilege extends Model {}

Privilege.init(
  {
    priviledgeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Privilege',
    tableName: 'priviledge',
    timestamps: false,
  }
);

module.exports = Privilege;