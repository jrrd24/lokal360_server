const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shop = require("./Shop");

const Promo = sequelize.define(
  "Promo",
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
    tableName: "promo",
    modelName: "Promo",
    timestamps: true,
  }
);

Promo.belongsTo(Shop, { foreignKey: "shopID", onDelete: "CASCADE" });
Shop.hasMany(Promo, { foreignKey: "shopID" });

module.exports = Promo;
