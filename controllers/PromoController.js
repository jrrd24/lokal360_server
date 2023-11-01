const Promo = require("../models/Promo");
const PromoType = require("../models/PromoType");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const { Op } = require("sequelize");

module.exports = {
  //FOR PROMO TYPE
  getAllPromoType: async (req, res) => {
    try {
      const promoType = await PromoType.findAll();
      res.status(200).json(promoType);
    } catch (error) {
      console.error("Get Promo Type Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  createPromoType: async (req, res) => {
    try {
      const [promoType, created] = await PromoType.findOrCreate({
        where: {
          promo_type_name: req.body?.promoTypeName,
        },
      });
      if (created) {
        res
          .status(200)
          .json({ message: "Promo Type Created Successfully", promoType });
      } else {
        res.status(409).json({ error: "Promo Type Already Exists" });
      }
    } catch (error) {
      console.error("Create Promo Type Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //FOR PROMOS
  getAllShopPromos: async (req, res) => {
    const { shopID } = req.query;

    try {
      const allShopPromo = await Promo.findAll({
        where: { shopID: shopID },
        attributes: [
          "promoID",
          "shopID",
          "promoTypeID",
          "discount_amount",
          "min_spend",
        ],
        include: [{ model: PromoType, attributes: ["promo_type_name"] }],
      });

      const shopPromoData = allShopPromo.map((promo) => ({
        promoID: promo.promoID,
        shopID: promo.shopID,
        promoTypeID: promo.promoTypeID,
        discount_amount: promo.discount_amount,
        min_spend: promo.min_spend,
        promo_type_name: promo.PromoType.promo_type_name,
      }));

      res.status(200).json(shopPromoData);
    } catch (error) {
      console.error("Get All Shop Promos Error", error);
      res.sendStatus(500);
    }
  },

  createPromo: async (req, res) => {
    const { shopID } = req.query;

    try {
      const [promo, created] = await Promo.findOrCreate({
        where: {
          shopID: shopID,
          promoTypeID: req.body?.promoType,
          discount_amount: req.body?.discountValue,
          min_spend: req.body?.minSpend,
        },
      });

      if (created) {
        res.status(200).json({ message: "Promo Created Successfully", promo });
      } else {
        res.status(409).json({ error: "Promo Already Exists" });
      }

      if (!promo.promoID) {
        return res.status(500).json({ error: "Failed to create Promo" });
      }
      await Product.update(
        { promoID: promo.promoID },
        { where: { productID: { [Op.in]: req.body.promoProducts } } }
      );
    } catch (error) {
      console.error("Create Promo Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updatePromo: async (req, res) => {
    const { promoID } = req.query;
    try {
      await Promo.update(
        {
          promoTypeID: req.body?.promoType,
          discount_amount: req.body?.discountValue,
          min_spend: req.body?.minSpend,
        },
        { where: { promoID: promoID } }
      );

      await Product.update(
        { promoID: promoID },
        { where: { productID: { [Op.in]: req.body.promoProducts } } }
      );

      await Product.update(
        { promoID: null },
        { where: { productID: { [Op.in]: req.body.noPromoProducts } } }
      );

      res.sendStatus(200);
    } catch (error) {
      console.error("Update Promo Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deletePromo: async (req, res) => {
    const { promoID } = req.query;
    try {
      await Promo.destroy({
        where: {
          promoID: promoID,
        },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Delete Promo Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  restorePromo: async (req, res) => {
    const { promoID } = req.query;
    try {
      await Promo.restore({
        where: {
          promoID: promoID,
        },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Promo Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getAllPromoProducts: async (req, res) => {
    const { promoID } = req.query;

    try {
      const inPromo = await Product.findAll({
        where: { promoID: promoID },
        attributes: ["productID", "shopID", "promoID", "product_name"],
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });

      const notInPromo = await Product.findAll({
        where: {
          [Op.or]: [
            { promoID: null },
            { "$Promo.deletedAt$": { [Op.not]: null } },
          ],
        },
        attributes: ["productID", "shopID", "promoID", "product_name"],
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
          {
            model: Promo,
            attributes: [],
            paranoid: false,
          },
        ],
      });

      res.status(200).json({ inPromo, notInPromo });
    } catch (error) {
      console.log("Get Promo Products Error", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Retrieve Products" });
    }
  },
};
