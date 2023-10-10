const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

const Category = sequelize.define(
  "Category",
  {
    categoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    icon_file_path: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "category",
    timestamps: false,
  }
);

module.exports = Category;
