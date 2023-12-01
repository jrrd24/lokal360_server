const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

const ShopOwner = sequelize.define(
  "ShopOwner",
  {
    shopOwnerID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "shop_owner",
    modelName: "ShopOwner",
    timestamps: true,
    paranoid: true,
  }
);

ShopOwner.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasOne(ShopOwner, { foreignKey: "userID" });

module.exports = ShopOwner;
