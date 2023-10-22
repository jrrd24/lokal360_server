const ShopCategory = require("../models/ShopCategory");

module.exports = {
  getAllShopCategory: async (req, res) => {
    const { shopID } = req.query;
    try {
      const allShopCategory = await ShopCategory.findAll({
        where: { shopID: shopID },
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

  restoreShopCategory: async (req, res)=>{
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
      const existingCategory = await ShopCategory.findOne({
        where: {
          shop_category_name: req.body.shopCategoryName,
          shopID: req.body.shopID,
        },
      });

      if (existingCategory) {
        return res.status(409).json({ error: "Shop Category Already Exists" });
      }

      await ShopCategory.update(
        { shop_category_name: req.body.shopCategoryName },
        { where: { shopCategoryID: shopCategoryID } }
      );
      return res.sendStatus(200);
    } catch (error) {
      console.error("Delete Shop Category Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
