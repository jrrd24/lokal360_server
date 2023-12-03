const Shopper = require("../models/Shopper");
const User = require("../models/User");
const ShopperFollowShop = require("../models/ShopperFollowShop");
const Shop = require("../models/Shop");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ProductVariation = require("../models/ProductVariation");
const Product = require("../models/Product");

module.exports = {
  getAllShopCustomer: async (req, res) => {
    const { shopID, limit } = req.query;

    try {
      const shopCustomers = await Order.findAll({
        attributes: ["shopperID"],
        include: [
          {
            model: OrderItem,
            attributes: [],
            include: [
              {
                model: ProductVariation,
                attributes: [],
                include: [
                  {
                    model: Product,
                    attributes: [],
                    where: {
                      shopID: shopID,
                    },
                  },
                ],
                required: true,
              },
            ],
            required: true,
          },
        ],
      });

      const distinctShopCustomers = Array.from(
        new Set(shopCustomers.map((customer) => customer.shopperID))
      );

      // Count the number of orders for each shopper using the shopCustomers data
      const orderCounts = {};
      shopCustomers.forEach((customer) => {
        orderCounts[customer.shopperID] =
          orderCounts[customer.shopperID] + 1 || 1;
      });

      const userInfo = await Shopper.findAll({
        where: { shopperID: distinctShopCustomers },
        attributes: ["username", "shopperID"],
        include: [
          {
            model: User,
            attributes: [
              "userID",
              "first_name",
              "last_name",
              "profile_pic",
              "status",
            ],
          },
          {
            model: ShopperFollowShop,
            where: { shopperID: distinctShopCustomers },
            required: false,
          },
        ],
      });

      // Combine the shopCustomers data with the order counts
      const userInfoWithCounts = distinctShopCustomers.map((shopperID) => {
        return {
          shopperID,
          orderCount: orderCounts[shopperID] || 0,
        };
      });

      // Sort the combined data in descending order based on order count
      const sortedCombinedData = userInfoWithCounts.sort(
        (a, b) => b.orderCount - a.orderCount
      );

      // Limit the response
      const limitedCombinedData = sortedCombinedData.slice(0, limit);

      const response = limitedCombinedData.map((shopperData) => {
        const userInformation = userInfo.find(
          (user) => user.shopperID === shopperData.shopperID
        );

        console.log("STAT", userInformation.User?.status);

        return {
          ...shopperData,
          first_name: userInformation.User?.first_name,
          last_name: userInformation.User?.last_name,
          profile_pic: userInformation.User?.profile_pic,
          username: userInformation.username,
          status:
            userInformation.User.status !== "Regular"
              ? userInformation.User.status
              : userInformation.ShopperFollowShop
              ? "Follower"
              : "Regular",
        };
      });

      res.status(200).json(response);
    } catch (error) {
      console.error("Get Shop Customers Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Get Shop Customers`,
      });
    }
  },

  followShop: async (req, res) => {
    const { shopID, shopperID } = req.query;

    try {
      const softDeletedEntry = await ShopperFollowShop.findOne({
        where: { shopperID: shopperID, shopID: shopID },
        paranoid: false, // Include soft-deleted entries in the search
      });

      if (softDeletedEntry) {
        await softDeletedEntry.restore();
        res.status(200).json({
          follow: softDeletedEntry,
          message: "Restored and Followed Shop",
        });
      } else {
        const [follow, created] = await ShopperFollowShop.findOrCreate({
          where: { shopperID: shopperID, shopID: shopID },
        });

        if (created) {
          res.status(200).json({ follow, message: "Followed Shop" });
        } else {
          res.status(409).json({ error: "Already Following Shop" });
        }
      }
    } catch (error) {
      console.error("Follow Shop Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Follow Shop`,
      });
    }
  },

  unfollowShop: async (req, res) => {
    const { shopID, shopperID } = req.query;

    try {
      await ShopperFollowShop.destroy({
        where: { shopperID: shopperID, shopID: shopID },
      });

      res.status(200).json({ message: "Unfollowed Shop" });
    } catch (error) {
      console.error("Unfollow Shop Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Unfollow Shop`,
      });
    }
  },

  checkFollowShop: async (req, res) => {
    const { shopID, shopperID } = req.query;

    try {
      isFollowing = await ShopperFollowShop.findOne({
        where: { shopID: shopID, shopperID: shopperID },
      });
      if (isFollowing) res.status(200).json(true);
      else res.status(200).json(false);
    } catch (error) {
      console.error("Check Follow Shop Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Follow Shop`,
      });
    }
  },
};
