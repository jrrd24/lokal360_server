const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Promo = require("./Promo");

const PromoType = sequelize.define(
  "PromoType",
  {
    promoTypeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    promo_type_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    tableName: "promo_type",
    modelName: "PromoType",
    timestamps: true,
    paranoid: true,
  }
);

Promo.belongsTo(PromoType, { foreignKey: "promoTypeID", onDelete: "CASCADE" });
PromoType.hasMany(Promo, { foreignKey: "promoTypeID" });

module.exports = PromoType;
