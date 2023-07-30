const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const ShopOwner = require("./ShopOwner");
const Category = require("./Category");

class Shop extends Model {}

Shop.init(
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
      allowNull: false,
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
    address_city: {
      type: DataTypes.STRING(100),
    },
    address_country: {
      type: DataTypes.STRING(50),
    },
    address_district: {
      type: DataTypes.STRING(50),
    },
    address_iso_country_code: {
      type: DataTypes.STRING(3),
    },
    address_postal_code: {
      type: DataTypes.CHAR(4),
    },
    address_region: {
      type: DataTypes.STRING(50),
    },
    address_street: {
      type: DataTypes.STRING(50),
    },
    address_street_no: {
      type: DataTypes.INTEGER,
    },
    phone_number: {
      type: DataTypes.STRING(20),
    },
    website_link: {
      type: DataTypes.STRING(255),
    },
    is_open_mon: {
      type: DataTypes.BOOLEAN,
    },
    is_open_tues: {
      type: DataTypes.BOOLEAN,
    },
    is_open_wed: {
      type: DataTypes.BOOLEAN,
    },
    is_open_thurs: {
      type: DataTypes.BOOLEAN,
    },
    is_open_fri: {
      type: DataTypes.BOOLEAN,
    },
    is_open_sat: {
      type: DataTypes.BOOLEAN,
    },
    is_open_sun: {
      type: DataTypes.BOOLEAN,
    },
    time_open: {
      type: DataTypes.TIME,
    },
    time_close: {
      type: DataTypes.TIME,
    },
    logo_img_link: {
      type: DataTypes.STRING(255),
    },
    header_img_link: {
      type: DataTypes.STRING(255),
    },
    custom_color_hex: {
      type: DataTypes.STRING(7),
    },
    custom_low_stock_lvl: {
      type: DataTypes.INTEGER,
    },
    sells_raw_mats: {
      type: DataTypes.BOOLEAN,
    },
  },
  {
    sequelize,
    modelName: "Shop",
    tableName: "shop",
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
