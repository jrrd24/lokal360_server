const User = require("../models/User");
const ShopOwner = require("../models/ShopOwner");
const ShopEmployee = require("../models/ShopEmployee");
const Shop = require("../models/Shop");

module.exports = {
  //get shop info
  getShopInfo: async (req, res) => {
    const { userID } = req.query;
    try {
      const result = await Shop.findAll({
        include: [
          {
            model: ShopOwner,
            include: [
              {
                model: User,
                required: true,
                where: {
                  userID: userID,
                },
              },
            ],
          },
          {
            model: ShopEmployee,
            include: [
              {
                model: User,
                required: true,
                where: {
                  userID: userID,
                },
              },
            ],
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
