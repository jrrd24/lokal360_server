const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const Product = require("./Product");
const VarInventory = require("./VarInventory");

class ProductVariation extends Model {}

ProductVariation.init(
  {
    prodVariationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    varInventoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    var_image: {
      type: DataTypes.STRING(255),
    },
  },
  {
    sequelize,
    modelName: "ProductVariation",
    tableName: "product_variation",
    timestamps: false,
  }
);

ProductVariation.belongsTo(Product, {
  foreignKey: "productID",
  onDelete: "CASCADE",
});
Product.hasMany(ProductVariation, { foreignKey: "productID" });

ProductVariation.belongsTo(VarInventory, {
  foreignKey: "varInventoryID",
  onDelete: "CASCADE",
});
VarInventory.hasOne(ProductVariation, { foreignKey: "productID" });

module.exports = ProductVariation;
