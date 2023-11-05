const Voucher = require("../models/Voucher");
const VoucherAppliedProduct = require("../models/VoucherAppliedProduct");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const Promo = require("../models/Promo");
const PromoType = require("../models/PromoType");
const { Op } = require("sequelize");
const Shop = require("../models/Shop");

module.exports = {
  getAllShopVoucher: async (req, res) => {
    const { shopID } = req.query;

    try {
      const allShopVoucherData = await Voucher.findAll({
        where: { shopID: shopID },
        attributes: [
          "voucherID",
          "shopID",
          "promoID",
          "start_date",
          "end_date",
        ],
        include: [
          {
            model: Promo,
            attributes: ["promoID", "discount_amount", "min_spend"],
            include: [
              {
                model: PromoType,
                attributes: ["promo_type_name"], // Include promo_type_name attribute
              },
            ],
          },
          { model: Shop, attributes: ["shop_name", "logo_img_link"] },
        ],
      });

      const allShopVoucher = allShopVoucherData.map((voucher) => {
        const startDate = new Date(voucher.start_date);
        const endDate = new Date(voucher.end_date);
        const currentDate = new Date();

        const isActive = currentDate >= startDate && currentDate <= endDate;

        return {
          voucherID: voucher.voucherID,
          shopID: voucher.shopID,
          shop_name: voucher.Shop.shop_name,
          logo_img_link: voucher.Shop.logo_img_link,
          promoID: voucher.promoID,
          discount_amount: voucher.Promo.discount_amount,
          min_spend: voucher.Promo.min_spend,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive,
          promo_type: voucher.Promo.PromoType.promo_type_name,
        };
      });
      //SORT
      allShopVoucher.sort((a, b) =>
        a.is_active === b.is_active ? 0 : a.is_active ? -1 : 1
      );

      res.status(200).json(allShopVoucher);
    } catch (error) {
      console.error("Get All Shop Vouchers Error", error);
      res.sendStatus(500);
    }
  },

  getAllActiveShopVoucher: async (req, res) => {
    const currentDate = new Date();
    const { shopID } = req.query;

    try {
      const activeVoucherData = await Voucher.findAll({
        where: {
          shopID: shopID,
          start_date: { [Op.lte]: currentDate },
          end_date: { [Op.gte]: currentDate },
        },
        attributes: [
          "voucherID",
          "shopID",
          "promoID",
          "start_date",
          "end_date",
        ],
        include: [
          {
            model: Promo,
            attributes: ["promoID", "discount_amount", "min_spend"],
            include: [
              {
                model: PromoType,
                attributes: ["promo_type_name"], // Include promo_type_name attribute
              },
            ],
          },
          { model: Shop, attributes: ["shop_name", "logo_img_link"] },
        ],
      });

      const allActiveVoucher = activeVoucherData.map((voucher) => {
        const startDate = new Date(voucher.start_date);
        const endDate = new Date(voucher.end_date);

        const isActive = currentDate >= startDate && currentDate <= endDate;

        return {
          voucherID: voucher.voucherID,
          shopID: voucher.shopID,
          shop_name: voucher.Shop.shop_name,
          logo_img_link: voucher.Shop.logo_img_link,
          promoID: voucher.promoID,
          discount_amount: voucher.Promo.discount_amount,
          min_spend: voucher.Promo.min_spend,
          start_date: startDate,
          end_date: endDate,
          is_active: isActive,
          promo_type: voucher.Promo.PromoType.promo_type_name,
        };
      });

      res.status(200).json(allActiveVoucher);
    } catch (error) {
      console.error("Get All Shop Vouchers Error", error);
      res.sendStatus(500);
    }
  },

  createVoucher: async (req, res) => {
    const { shopID } = req.query;

    // SET START AND END TIME FOR VOUCHER EXPIRATION
    const startDateTime = new Date(req.body?.startDate);
    const endDateTime = new Date(req.body?.endDate);

    // SET START TO 12 AM END TO 11:59 PM (ADJUST TO TRIMEZONE)
    startDateTime.setHours(0, 0, 0, 0);
    endDateTime.setHours(23, 59, 59, 999);
    const timezoneOffset = startDateTime.getTimezoneOffset();
    startDateTime.setMinutes(startDateTime.getMinutes() - timezoneOffset);
    endDateTime.setMinutes(endDateTime.getMinutes() - timezoneOffset);

    try {
      const [voucher, creatconsted] = await Voucher.findOrCreate({
        where: {
          shopID: shopID,
          promoID: req.body?.promoID,
          start_date: startDateTime,
          end_date: endDateTime,
        },
      });

      if (created) {
        if (
          req.body?.voucherProducts &&
          Array.isArray(req.body?.voucherProducts)
        ) {
          // Loop through voucherProducts array and create VoucherAppliedProduct for each productID
          for (const productID of req.body?.voucherProducts) {
            await VoucherAppliedProduct.create({
              productID: productID,
              voucherID: voucher.voucherID,
            });
          }
        }

        res
          .status(200)
          .json({ message: "Voucher Created Successfully", voucher });
      } else {
        res.status(409).json({ error: "Voucher Already Exists" });
      }
    } catch (error) {
      console.error("Create Voucher Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  updateVoucher: async (req, res) => {
    console.log("REEQ", req.body);
    const { voucherID } = req.query;
    try {
      await VoucherAppliedProduct.destroy({
        where: {
          voucherID: voucherID,
          productID: { [Op.in]: req.body?.notVoucherProducts },
        },
      });

      for (const productID of req.body?.voucherProducts) {
        await VoucherAppliedProduct.findOrCreate({
          where: {
            productID: productID,
            voucherID: voucherID,
          },
        });
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Update Voucher Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteVoucher: async (req, res) => {
    const { voucherID } = req.query;

    try {
      await Voucher.destroy({
        where: { voucherID: voucherID },
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Delete Voucher Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  restoreVoucher: async (req, res) => {
    const { voucherID } = req.query;

    try {
      await Voucher.restore({
        where: { voucherID: voucherID },
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Voucher Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  //GET ALL PRODUCTS FOR VOUCHER
  getAllVoucherProducts: async (req, res) => {
    const { voucherID, shopID } = req.query;

    try {
      const allProducts = await Product.findAll({
        where: { shopID: shopID },
        attributes: ["productID", "shopID", "product_name"],
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });

      const inVoucherData = await VoucherAppliedProduct.findAll({
        where: { voucherID: voucherID, "$Product.shopID$": shopID },
        include: [
          {
            model: Product,
            attributes: ["productID", "shopID", "promoID", "product_name"],
            include: [
              {
                model: ProductImage,
                attributes: ["prod_image"],
              },
            ],
          },
        ],
      });

      const notInVoucherData = await VoucherAppliedProduct.findAll({
        where: {
          voucherID: { [Op.not]: voucherID },
          "$Product.shopID$": shopID,
        },
        include: [
          {
            model: Product,
            attributes: ["productID", "shopID", "promoID", "product_name"],
            include: [
              {
                model: ProductImage,
                attributes: ["prod_image"],
              },
            ],
          },
        ],
      });

      const filteredNotInVoucher = [];
      const uniqueInVoucherProducts = [];
      const uniqueProducts = [];
      inVoucherData.forEach((item) => {
        const { productID } = item.Product;
        uniqueInVoucherProducts[productID] = true;
      });

      notInVoucherData.forEach((item) => {
        const { productID } = item.Product;
        if (!uniqueProducts[productID] && !uniqueInVoucherProducts[productID]) {
          uniqueProducts[productID] = true;
          filteredNotInVoucher.push(item);
        }
      });

      const inVoucher = inVoucherData.map((voucher) => ({
        voucherAppliedProductID: voucher.voucherAppliedProductID,
        voucherID: voucher.voucherID,
        productID: voucher.productID,
        shopID: voucher.Product.shopID,
        promoID: voucher.Product.promoID,
        product_name: voucher.Product.product_name,
        ProductImages: voucher.Product.ProductImages,
      }));

      const notInVoucher = filteredNotInVoucher.map((voucher) => ({
        voucherAppliedProductID: voucher.voucherAppliedProductID,
        voucherID: voucher.voucherID,
        productID: voucher.productID,
        shopID: voucher.Product.shopID,
        promoID: voucher.Product.promoID,
        product_name: voucher.Product.product_name,
        ProductImages: voucher.Product.ProductImages,
      }));

      res.status(200).json({ allProducts, inVoucher, notInVoucher });
    } catch (error) {
      console.log("Get Voucher Products Error", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Retrieve Products" });
    }
  },

  getAllVoucherPromos: async (req, res) => {
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

      const allPromos = allShopPromo.map((promo) => ({
        promoID: promo.promoID,
        shopID: promo.shopID,
        promoTypeID: promo.promoTypeID,
        discount_amount: promo.discount_amount,
        min_spend: promo.min_spend,
        promo_type_name: promo.PromoType.promo_type_name,
      }));

      res.status(200).json({ allPromos });
    } catch (error) {
      console.error("Get All Shop Promos Error", error);
      res.sendStatus(500);
    }
  },
};
