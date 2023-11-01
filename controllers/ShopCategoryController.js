const { Op } = require("sequelize");
const Product = require("../models/Product");
const ProductVariation = require("../models/ProductVariation");
const ProductImage = require("../models/ProductImage");
const ShopCategory = require("../models/ShopCategory");
const sequelize = require("../config/sequelize");

module.exports = {
  getAllShopCategory: async (req, res) => {
    const { shopID } = req.query;
    try {
      const allShopCategory = await ShopCategory.findAll({
        where: { shopID: shopID },
        include: [
          {
            model: Product,
            attributes: [],
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
          [
            sequelize.fn(
              "COUNT",
              sequelize.fn("DISTINCT", sequelize.col("Products.productID"))
            ),
            "number_of_products",
          ],
          [
            sequelize.cast(
              sequelize.fn(
                "SUM",
                sequelize.col("Products.ProductVariations.amt_sold")
              ),
              "unsigned"
            ),

            "total_sold",
          ],
        ],
        group: ["ShopCategory.shopCategoryID"],
      });

      if (allShopCategory.length > 0) {
        res.status(200).json(allShopCategory);
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
