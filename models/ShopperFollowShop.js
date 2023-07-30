const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Shopper = require("./Shopper");
const Shop = require("./Shop");

class ShopperFollowShop extends Model {}

ShopperFollowShop.init(
  {
    shopperFollowShopID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopperID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shopID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    followed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "ShopperFollowShop",
    tableName: "shopper_follow_shop",
    timestamps: true,
    createdAt: "followed_at",
    updatedAt: false,
  }
);

Shopper.belongsToMany(Shop, {
  through: ShopperFollowShop,
  foreignKey: "shopperID",
  onDelete: "CASCADE",
});
Shop.belongsToMany(Shopper, {
  through: ShopperFollowShop,
  foreignKey: "shopID",
  onDelete: "CASCADE",
});

module.exports = ShopperFollowShop;
