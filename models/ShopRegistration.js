const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Category = require("./Category");
const User = require("./User");

const ShopRegistration = sequelize.define(
  "ShopRegistration",
  {
    shopRegistrationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shop_name: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    shop_type: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    attachment_DTI_CBNR: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attachment_DTI_other: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attachment_BIR_COR: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attachment_valid_id_front: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attachment_valid_id_back: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    attachment_products_list: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING(500),
    },
    contact_email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contact_number: {
      type: DataTypes.STRING(17),
      allowNull: false,
    },
    resolution_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "shop_registration",
    modelName: "ShopRegistration",
    timestamps: true,
    updatedAt: false,
    paranoid: true,
  }
);

ShopRegistration.belongsTo(User, {
  foreignKey: "userID",
  onDelete: "CASCADE",
});
User.hasMany(ShopRegistration, { foreignKey: "userID" });

ShopRegistration.belongsTo(Category, {
  foreignKey: "categoryID",
  onDelete: "CASCADE",
});
Category.hasMany(ShopRegistration, { foreignKey: "categoryID" });

module.exports = ShopRegistration;
