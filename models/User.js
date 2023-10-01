const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "User",
  {
    userID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(512),
    },
    first_name: {
      type: DataTypes.STRING(100),
    },
    last_name: {
      type: DataTypes.STRING(50),
    },
    mobile_num: {
      type: DataTypes.STRING(17),
      allowNull: false,
    },
    birthday: {
      type: DataTypes.DATEONLY,
    },
    gender: {
      type: DataTypes.STRING(20),
    },
    profile_pic: {
      type: DataTypes.STRING(255),
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Regular",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_shopper: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_shop_owner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_shop_employee: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "user",
    modelName: "User",
    timestamps: true,
  }
);

module.exports = User;
