const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shop = require("./Shop");

const LokalAds = sequelize.define(
  "LokalAds",
  {
    lokalAdsID: {
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
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(500),
    },
    ad_image: {
      type: DataTypes.STRING(255),
    },
    approved_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "lokal_ads",
    modelName: "LokalAds",
    timestamps: true,
  }
);

LokalAds.belongsTo(Shop, { foreignKey: "shopID", onDelete: "CASCADE" });
Shop.hasMany(LokalAds, { foreignKey: "shopID" });

module.exports = LokalAds;
