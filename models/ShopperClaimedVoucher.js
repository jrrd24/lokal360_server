const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shopper = require("./Shopper");
const Voucher = require("./Voucher");

const ShopperClaimedVoucher = sequelize.define(
  "ShopperClaimedVoucher",
  {
    shopperClaimedVoucherID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopperID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    voucherID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    date_claimed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "shopper_claimed_voucher",
    modelName: "ShopperClaimedVoucher",
    timestamps: false,
  }
);

Shopper.belongsToMany(Voucher, {
  through: ShopperClaimedVoucher,
  foreignKey: "shopperID",
  onDelete: "CASCADE",
});
Voucher.belongsToMany(Shopper, {
  through: ShopperClaimedVoucher,
  foreignKey: "voucherID",
  onDelete: "CASCADE",
});

module.exports = ShopperClaimedVoucher;
