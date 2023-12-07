const User = require("../models/User");
const { paginate } = require("../helpers/Paginate");
const Shopper = require("../models/Shopper");
const LokalAds = require("../models/LokalAds");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Shop = require("../models/Shop");
const moment = require("moment/moment");
const ShopOwner = require("../models/ShopOwner");

module.exports = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAndCountAll({
        attributes: [
          "userID",
          "first_name",
          "last_name",
          "profile_pic",
          "is_shopper",
          "is_shop_owner",
          "is_shop_employee",
          "is_admin",
          "status",
        ],
        include: [{ model: Shopper, attributes: ["username"] }],
        order: [["createdAt", "DESC"]],
      });

      const flattenedUsers = users.rows.map((user) => {
        const flattenedUser = {
          userID: user.userID,
          username:
            user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.Shopper?.username,
          img: user.profile_pic,
          user_type: user.is_shop_owner
            ? "Merchant"
            : user.is_shop_employee
            ? "Employee"
            : user.is_shopper
            ? "Shopper"
            : "Admin",
          status: user.status,
        };

        return flattenedUser;
      });

      res.status(200).json(flattenedUsers);
    } catch (error) {
      console.error("Get All Users Error: ", error);
      res.status(500).send("Internal Server Error: Cannot Retreive Users");
    }
  },

  getAllSitewideAds: async (req, res) => {
    try {
      const allSitewideAds = await LokalAds.findAll({
        where: {
          type: 2,
        },
        attributes: [
          "lokalAdsID",
          "ad_image",
          "ad_name",
          "status",
          "start_date",
          "end_date",
        ],
        include: [{ model: Shop, attributes: ["shop_name"] }],
      });

      const flattenedAds = allSitewideAds.map((ad) => {
        const startDate = new Date(ad.start_date);
        const endDate = new Date(ad.end_date);
        const currentDate = new Date();

        const isActive = currentDate >= startDate && currentDate <= endDate;
        const isExpired = currentDate > endDate;

        const formattedStartDate = moment(startDate).format("MM/DD/YYYY");
        const formattedEndDate = moment(endDate).format("MM/DD/YYYY");

        const flattenedAd = {
          lokalAdsID: ad.lokalAdsID,
          ad_image: ad.ad_image,
          ad_name: ad.ad_name,
          status:
            isActive && ad.status === "Approved"
              ? "Active"
              : isExpired ||
                (ad.status === "Pending Approval" && currentDate > startDate)
              ? "Expired"
              : ad.status,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          shop_name: ad.Shop.shop_name,
        };

        return flattenedAd;
      });

      const statusOrder = [
        "Pending Approval",
        "Active",
        "Approved",
        "Rejected",
        "Expired",
      ];

      flattenedAds.sort(
        (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
      );

      res.status(200).json(flattenedAds);
    } catch (error) {
      console.error("Get All Sitewide Ads: ", error);
      res
        .status(500)
        .send("Internal Server Error: Cannot Retreive Sitewide Ads");
    }
  },

  getAllCategories: async (req, res) => {
    // const { page, pageSize } = req.query;

    try {
      const categories = await Category.findAndCountAll({
        // ...paginate({ page: parseInt(page), pageSize: parseInt(pageSize) }),
      });

      const categoryResults = [];

      for (const category of categories.rows) {
        const productCount = await Product.count({
          where: { categoryID: category.categoryID },
        });

        const shopCount = await Shop.count({
          where: { categoryID: category.categoryID },
        });

        categoryResults.push({
          categoryID: category.categoryID,
          category_name: category.category_name,
          count_product: productCount,
          count_shop: shopCount,
        });
      }

      res
        .status(200)
        .json({ categories: categoryResults, count: categories.count });
    } catch (error) {
      console.error("Get All Categories: ", error);
      res.status(500).send("Internal Server Error: Cannot Retreive Categories");
    }
  },

  getAllShops: async (req, res) => {
    try {
      const allShops = await Shop.findAll({
        attributes: [
          "shopID",
          "shop_name",
          "logo_img_link",
          "sells_raw_mats",
          "is_360_partner",
        ],
        include: {
          model: ShopOwner,
          attributes: ["shopOwnerID"],
          include: { model: User, attributes: ["first_name", "last_name"] },
        },
      });

      const flattenedData = allShops.map((shop) => ({
        shopID: shop.shopID,
        shop_name: shop.shop_name,
        logo_img_link: shop.logo_img_link,
        sells_raw_mats: shop.sells_raw_mats,
        is_360_partner: shop.is_360_partner,
        shopOwnerID: shop.ShopOwner.shopOwnerID,
        owner_name: `${shop.ShopOwner.User.first_name} ${shop.ShopOwner.User.last_name}`,
      }));

      res.status(200).json(flattenedData);
    } catch (error) {
      console.error("Get All Shops: ", error);
      res.status(500).send("Internal Server Error: Cannot Retreive Shops");
    }
  },
};
