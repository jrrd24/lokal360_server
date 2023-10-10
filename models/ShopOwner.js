const { DataTypes } = require("sequelize");
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
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    phone_num: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    tableName: "shop_owner",
    modelName: "ShopOwner",
    timestamps: false,
  }
);

ShopOwner.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasOne(ShopOwner, { foreignKey: "userID" });

module.exports = ShopOwner;
