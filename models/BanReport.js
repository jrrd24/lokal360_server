const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");
const Shop = require("./Shop");
const Shopper = require("./Shopper");

const BanReport = sequelize.define(
  "BanReport",
  {
    banReportID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    reporter_userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reported_shopID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reported_shopperID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    resolution: {
      type: DataTypes.STRING(20),
    },
    ban_type: {
      type: DataTypes.STRING(15),
    },
    ban_duration: {
      type: DataTypes.INTEGER,
    },
    message: {
      type: DataTypes.STRING(500),
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    resolved_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "ban_report",
    modelName: "BanReport",
    timestamps: true,
    createdAt: "createdAt",
    updatedAt: "resolved_at",
  }
);

BanReport.belongsTo(User, {
  foreignKey: "reporter_userID",
  onDelete: "CASCADE",
});
User.hasMany(BanReport, { foreignKey: "reporter_userID" });

BanReport.belongsTo(Shop, {
  foreignKey: "reported_shopID",
  onDelete: "CASCADE",
});
Shop.hasMany(BanReport, { foreignKey: "reported_shopID" });

BanReport.belongsTo(Shopper, {
  foreignKey: "reported_shopperID",
  onDelete: "CASCADE",
});
Shopper.hasMany(BanReport, { foreignKey: "reported_shopperID" });

module.exports = BanReport;
