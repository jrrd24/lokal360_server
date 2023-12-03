const User = require("../models/User");
const Shop = require("../models/Shop");
const ShopOwner = require("../models/ShopOwner");
const ShopEmployee = require("../models/ShopEmployee");
const { createTokens } = require("../helpers/JWT");
const { verify } = require("jsonwebtoken");
const { access } = require("fs");
const Shopper = require("../models/Shopper");

module.exports = {
  // login user
  handleRefreshToken: async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.["jwt"]) {
      return res.sendStatus(401);
    }
    const refreshToken = cookies["jwt"];

    //find user
    const foundUser = await User.findOne({ where: { token: refreshToken } });
    if (!foundUser) return res.status(403); //Forbidden

    //evaluate jwt
    verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err || !decoded || foundUser.userID !== decoded.userID) {
          return res.sendStatus(403);
        }

        const tokens = createTokens(foundUser);
        const roles = decoded.roles;
        const accessToken = tokens.accessToken;
        const userID = foundUser.userID;

        //get shopperID
        let shopperID = null;
        try {
          const shopperIDData = await Shopper.findOne({
            where: { userID: userID },
            attributes: ["shopperID"],
          });
          shopperID = shopperIDData.shopperID;
        } catch (error) {
          console.error("Fetch Shopper ID error", error);
          res.status(500).json({ error: "Internal Server Error" });
        }

        // get shop ID (for shop owners and shop employees)
        // will be null if user is not owner or employee
        let userShopID = null;
        let shopID = null;
        try {
          userShopID = await Shop.findAll({
            attributes: ["shopID"],
            include: [
              {
                model: ShopOwner,
                where: { userID: userID },
                include: [
                  {
                    model: User,
                    required: true,
                    where: {
                      userID: userID,
                    },
                    attributes: [],
                  },
                ],
                attributes: [],
              },
            ],
          });
        } catch (error) {
          console.error("Fetch Shop ID error", error);
          res.status(500).json(error);
        }
        if (userShopID && userShopID.length > 0) {
          shopID = userShopID[0].shopID;
        }

        let userShopEmployeeID = null;
        let employeePriviledges = {};
        try {
          userShopEmployeeID = await ShopEmployee.findOne({
            where: { userID: userID },
          });
        } catch (error) {
          console.error("Fetch Shop ID error", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        if (userShopEmployeeID) {
          shopID = userShopEmployeeID.shopID;
          const accessRights = {
            accessAnalytics: userShopEmployeeID.access_analytics || false,
            accessProducts: userShopEmployeeID.access_products || false,
            accessCustomers: userShopEmployeeID.access_customers || false,
            accessOrders: userShopEmployeeID.access_orders || false,
            accessShopInformation:
              userShopEmployeeID.access_shop_information || false,
            accessPromos: userShopEmployeeID.access_promos || false,
            accessLokalAds: userShopEmployeeID.access_lokal_ads || false,
            accessVouchers: userShopEmployeeID.access_vouchers || false,
          };

          employeePriviledges = accessRights;
        }

        res.json({
          accessToken,
          roles,
          userID,
          shopperID,
          shopID,
          employeePriviledges,
        });
      }
    );
  },
};
