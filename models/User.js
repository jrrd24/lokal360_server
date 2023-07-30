const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");

class User extends Model {}

User.init(
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
    user_role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Shopper",
    },
  
  },
  {
    sequelize,
    modelName: "User",
    tableName: "user",
    timestamps: true,
  }

);

module.exports = User;
