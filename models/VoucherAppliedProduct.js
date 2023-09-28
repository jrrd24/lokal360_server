const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Voucher = require("./Voucher");
const Product = require("./Product");

const VoucherAppliedProduct = sequelize.define(
  "VoucherAppliedProduct",
  {
    voucherAppliedProductID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    voucherID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "voucher_applied_product",
    modelName: "VoucherAppliedProduct",
    timestamps: false,
  }
);

VoucherAppliedProduct.belongsTo(Voucher, {
  foreignKey: "voucherID",
  onDelete: "CASCADE",
});
VoucherAppliedProduct.belongsTo(Product, {
  foreignKey: "productID",
  onDelete: "CASCADE",
});

module.exports = VoucherAppliedProduct;
