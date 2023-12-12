const { Op } = require("sequelize");
const Product = require("../models/Product");
const ProductVariation = require("../models/ProductVariation");
const ProductImage = require("../models/ProductImage");
const ShopCategory = require("../models/ShopCategory");
const sequelize = require("../config/sequelize");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

module.exports = {
  getAllShopCategory: async (req, res) => {
    const { shopID, limit, orderDESC } = req.query;

    try {
      const allShopCategory = await ShopCategory.findAll({
        where: { shopID: shopID },
        include: [
          {
            model: Product,
            attributes: ["productID"],
            where: { shopID: shopID },
            required: false,
            include: [
              {
                model: ProductVariation,
                attributes: [],
                required: false,
              },
            ],
          },
        ],
        attributes: [
          "shopCategoryID",
          "shopID",
          "shop_category_name",
          "createdAt",
        ],
        group: ["ShopCategory.shopCategoryID", "Products.productID"],
        order: orderDESC ? [["createdAt", "DESC"]] : [],
        subQuery: false,
      });

      const allShopCategoryData = await Promise.all(
        allShopCategory.map(async (category) => {
          // Number of Orders Count
          const totalCount = await OrderItem.sum("quantity", {
            where: {
              "$Order.status$": "Complete",
              "$ProductVariation.productID$": category.Products.map(
                (p) => p.productID
              ),
            },
            include: [
              {
                model: Order,
                attributes: [],
              },
              {
                model: ProductVariation,
                attributes: [],
              },
            ],
          });

          const productCount = category.Products.length;

          return {
            ...category.toJSON(),
            total_sold: totalCount || 0,
            number_of_products: productCount,
          };
        })
      );

      // Calculate the total products count without the limit
      const totalProductsCount = allShopCategoryData.reduce(
        (total, category) => total + category.total_sold,
        0
      );

      // Apply the limit after processing the results
      const shopCategories = allShopCategoryData.slice(
        0,
        parseInt(limit) || undefined
      );

      if (shopCategories.length > 0) {
        res.status(200).json({ shopCategories, totalProductsCount });
      } else {
        res.status(404).json({ error: "No Shop Categories Found" });
      }
    } catch (error) {
      console.error("Get All Shop Categories Error", error);
      res.sendStatus(500);
    }
  },

  createShopCategory: async (req, res) => {
    const { shopID } = req.query;
    try {
      const [shopCategory, created] = await ShopCategory.findOrCreate({
        where: {
          shop_category_name: req.body?.shopCategoryName,
          shopID: shopID,
        },
      });

      if (created) {
        res.status(200).json({
          message: "Shop Category Created Successfully",
          shopCategory,
        });
      } else {
        res.status(409).json({ error: "Shop Category Already Exists" });
      }

      if (!shopCategory.shopCategoryID) {
        return res
          .status(500)
          .json({ error: "Failed to create Shop Category" });
      }
      await Product.update(
        { shopCategoryID: shopCategory.shopCategoryID },
        { where: { productID: { [Op.in]: req.body.shopCategoryProducts } } }
      );
    } catch (error) {
      console.error("Create Shop Category Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteShopCategory: async (req, res) => {
    const { shopCategoryID } = req.query;
    try {
      await ShopCategory.destroy({
        where: {
          shopCategoryID: shopCategoryID,
        },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Delete Shop Category Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  restoreShopCategory: async (req, res) => {
    const { shopCategoryID } = req.query;
    try {
      await ShopCategory.restore({
        where: {
          shopCategoryID: shopCategoryID,
        },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Shop Category Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateShopCategory: async (req, res) => {
    const { shopCategoryID } = req.query;
    try {
      await ShopCategory.update(
        { shop_category_name: req.body.shopCategoryName },
        { where: { shopCategoryID: shopCategoryID } }
      );

      await Product.update(
        { shopCategoryID: shopCategoryID },
        { where: { productID: { [Op.in]: req.body.shopCategoryProducts } } }
      );

      await Product.update(
        { shopCategoryID: null },
        { where: { productID: { [Op.in]: req.body.noShopCategoryProducts } } }
      );

      return res.sendStatus(200);
    } catch (error) {
      console.error("Update Shop Category Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Shop Category Products
  getAllShopCategoryProducts: async (req, res) => {
    const { shopCategoryID } = req.query;
    try {
      const inShopCategory = await Product.findAll({
        where: { shopCategoryID: shopCategoryID },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });

      const notInShopCategory = await Product.findAll({
        where: {
          [Op.or]: [
            { shopCategoryID: null },
            { "$ShopCategory.deletedAt$": { [Op.not]: null } },
          ],
        },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
          {
            model: ShopCategory,
            paranoid: false,
          },
        ],
      });

      res.status(200).json({ inShopCategory, notInShopCategory });
    } catch (error) {
      console.log("GET SC PRODS", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Retrieve Products" });
    }
  },
};
