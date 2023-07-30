const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/sequelize");
const User = require("./User");

class Shopper extends Model {}

Shopper.init(
  {
    shopperID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Shopper",
    tableName: "shopper",
    timestamps: false,
  }
);

Shopper.belongsTo(User, { foreignKey: "userID", onDelete: "CASCADE" });
User.hasOne(Shopper, { foreignKey: "userID" });

module.exports = Shopper;
