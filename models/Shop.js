const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const ShopOwner = require("./ShopOwner");
const Category = require("./Category");

const Shop = sequelize.define(
  "Shop",
  {
    shopID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    shopOwnerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shipping_deliver_enabled: {
      type: DataTypes.BOOLEAN,
    },
    shipping_pickup_enabled: {
      type: DataTypes.BOOLEAN,
    },
    address_municipality: {
      type: DataTypes.STRING(100),
    },
    address_postal_code: {
      type: DataTypes.CHAR(4),
    },
    address_region: {
      type: DataTypes.STRING(50),
    },
    address_line_1: {
      type: DataTypes.STRING(200),
    },
    address_line_2: {
      type: DataTypes.STRING(200),
    },
    address_barangay: {
      type: DataTypes.STRING(100),
    },
    address_province: {
      type: DataTypes.STRING(100),
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 6),
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 6),
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    website_link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    is_open_mon: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_open_tues: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_open_wed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_open_thurs: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_open_fri: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_open_sat: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_open_sun: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    time_open: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    time_close: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    logo_img_link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    header_img_link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    custom_color_hex: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: "#6e5fde",
    },
    custom_low_stock_lvl: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sells_raw_mats: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "shop",
    modelName: "Shop",
    timestamps: true,
  }
);

Shop.belongsTo(ShopOwner, {
  foreignKey: "shopOwnerID",
  onDelete: "CASCADE",
});
ShopOwner.hasOne(Shop, { foreignKey: "shopOwnerID" });

Shop.belongsTo(Category, { foreignKey: "categoryID", onDelete: "CASCADE" });
Category.hasMany(Shop, { foreignKey: "category" });

module.exports = Shop;
