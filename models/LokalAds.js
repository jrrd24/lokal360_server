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
    ad_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    //TYPES
    //  1: Shop Page
    //  2: Sitewide
    type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Pending Approval",
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
    paranoid: true,
  }
);

LokalAds.belongsTo(Shop, { foreignKey: "shopID", onDelete: "CASCADE" });
Shop.hasMany(LokalAds, { foreignKey: "shopID" });

module.exports = LokalAds;
