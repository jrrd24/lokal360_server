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
    is_used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "shopper_claimed_voucher",
    modelName: "ShopperClaimedVoucher",
    timestamps: true,
    paranoid: true,
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

Voucher.belongsTo(ShopperClaimedVoucher, {
  foreignKey: "voucherID",
  onDelete: "CASCADE",
});
ShopperClaimedVoucher.hasOne(Voucher, { foreignKey: "voucherID" });

Shopper.belongsTo(ShopperClaimedVoucher, {
  foreignKey: "shopperID",
  onDelete: "CASCADE",
});
ShopperClaimedVoucher.hasOne(Shopper, { foreignKey: "shopperID" });

module.exports = ShopperClaimedVoucher;
