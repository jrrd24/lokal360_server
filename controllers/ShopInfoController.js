const User = require("../models/User");
const ShopOwner = require("../models/ShopOwner");
const ShopEmployee = require("../models/ShopEmployee");
const Shop = require("../models/Shop");
const Category = require("../models/Category");
const sequelize = require("../config/sequelize");

module.exports = {
  //get shop info
  getShopInfo: async (req, res) => {
    const { shopID } = req.query;
    try {
      const result = await Shop.findOne({
        where: { shopID: shopID },
        include: [
          {
            model: Category,
            attributes: ["category_name"],
            where: {
              categoryID: sequelize.col("Shop.categoryID"),
            },
          },
        ],
      });

      res.json(result); //Return Result
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
