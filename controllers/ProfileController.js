const User = require("../models/User");
const Shopper = require("../models/Shopper");
const ShopOwner = require("../models/ShopOwner");
const Admin = require("../models/Admin");
const ShopEmployee = require("../models/ShopEmployee");

module.exports = {
  //get profile
  getProfile: async (req, res) => {
    const { userID } = req.query;
    try {
      const result = await User.findAll({
        where: {
          userID: userID,
        },
        attributes: [
          "email",
          "first_name",
          "last_name",
          "mobile_num",
          "birthday",
          "gender",
          "profile_pic",
          "is_shop_owner",
          "is_shop_employee",
          "is_admin",
          "createdAt",
          "updatedAt",
        ],

        include: [
          {
            model: Shopper,
            required: true,
            attributes: ["username"],
          },

          { model: ShopEmployee },
          { model: ShopOwner },
          { model: Admin },
        ],
      });

      res.json(result); //Return Result
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //TODO: add update user profile
};
