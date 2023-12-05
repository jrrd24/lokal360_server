const Shop = require("../models/Shop");
const Category = require("../models/Category");
const sequelize = require("../config/sequelize");
const path = require("path");
const destinationFolder = "uploads/shop/logoAndHeader";
const destinationFolderDB = "shop/logoAndHeader";
const configureMulter = require("../helpers/MulterConfig");
const upload = configureMulter(destinationFolder);
const fs = require("fs");
const ShopperFollowShop = require("../models/ShopperFollowShop");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const ProductVariation = require("../models/ProductVariation");
const ShopperClaimedVoucher = require("../models/ShopperClaimedVoucher");
const Voucher = require("../models/Voucher");
const Promo = require("../models/Promo");
const PromoType = require("../models/PromoType");

module.exports = {
  //get shop info
  getShopInfo: async (req, res) => {
    const { shopID } = req.query;
    try {
      const shopInfo = await Shop.findOne({
        where: { shopID: shopID },
        include: [
          {
            model: Category,
            attributes: ["category_name"],
            where: {
              categoryID: sequelize.col("Shop.categoryID"),
            },
          },
        ],
      });

      const followerCount = await ShopperFollowShop.count({
        where: { shopID: shopInfo.shopID },
      });

      const productCount = await Product.count({
        where: { shopID: shopInfo.shopID },
      });

      const shopOrders = await Order.findAll({
        attributes: ["orderID", "shipping_fee"],
        where: { status: "Complete" },
        include: [
          {
            model: OrderItem,
            attributes: ["quantity", "prodVariationID"],
            include: [
              {
                model: ProductVariation,
                attributes: ["price"],
                include: [
                  {
                    model: Product,
                    attributes: ["shopID"],
                    where: { shopID: shopID },
                    required: true,
                  },
                ],
                required: true,
              },
            ],
            required: true,
          },
          {
            model: ShopperClaimedVoucher,
            attributes: ["shopperID"],
            include: [
              {
                model: Voucher,
                attributes: ["voucherID"],
                include: [
                  {
                    model: Promo,
                    attributes: ["discount_amount"],
                    include: [
                      {
                        model: PromoType,
                        attributes: ["promo_type_name"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      const allOrderAmountDue = shopOrders.map((order) => {
        // Calculate total price for each order
        const orderTotalPrice = order.OrderItems.reduce(
          (total, orderItem) =>
            total +
            parseInt(orderItem.quantity) *
              parseFloat(orderItem.ProductVariation.price),
          0
        );

        const orderItemsWithShipping =
          orderTotalPrice + parseFloat(order.shipping_fee);

        const discountAmount =
          order.ShopperClaimedVoucher &&
          order.ShopperClaimedVoucher.Voucher &&
          order.ShopperClaimedVoucher.Voucher.Promo
            ? parseFloat(
                order.ShopperClaimedVoucher.Voucher.Promo.discount_amount
              )
            : 0;

        const discountType =
          order.ShopperClaimedVoucher &&
          order.ShopperClaimedVoucher.Voucher &&
          order.ShopperClaimedVoucher.Voucher.Promo &&
          order.ShopperClaimedVoucher.Voucher.Promo.PromoType
            ? order.ShopperClaimedVoucher.Voucher.Promo.PromoType
                .promo_type_name
            : "";
            
        const totalWithDiscount =
          discountType === "Percent Discount"
            ? orderItemsWithShipping - orderItemsWithShipping * discountAmount
            : orderItemsWithShipping - discountAmount;
        return {
          amountDue: parseFloat(totalWithDiscount).toFixed(2),
        };
      });

      const totalSales = parseFloat(
        allOrderAmountDue.reduce((total, order) => {
          return total + parseFloat(order.amountDue);
        }, 0)
      ).toFixed(2);

      res.status(200).json({
        shopInfo,
        followerCount,
        productCount,
        totalSales,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //update shop info
  updateShopInfo: async (req, res) => {
    const { shopID } = req.query;

    // get existing file path if current shop exists
    let currentShop = null;
    try {
      currentShop = await Shop.findOne({
        where: { shopID: shopID },
        attributes: ["logo_img_link", "header_img_link"],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Unable to Find Shop" });
    }
    const existingLogoPath = `uploads/${currentShop?.logo_img_link}`;
    const existingHeaderPath = `uploads/${currentShop?.header_img_link}`;

    const timestamp = Date.now();
    const upload = configureMulter(destinationFolder, timestamp);

    upload.fields([{ name: "shopHeader" }, { name: "shopLogo" }])(
      req,
      res,
      async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "File upload error" });
        }

        console.log(req.body);
        const {
          addressBarangay,
          addressLine1,
          addressLine2,
          addressMunicipality,
          addressPostalCode,
          addressProvince,
          addressRegion,
          latitude,
          longitude,
          closingTime,
          openMonday,
          openTuesday,
          openWednesday,
          openThursday,
          openFriday,
          openSaturday,
          openSunday,
          delivery,
          hexColor,
          openingTime,
          phoneNumber,
          pickUp,
          productsCategory,
          sellsRawMaterials,
          shopDescription,
          shopName,
          shopType,
          shopWebsite,
        } = req.body;

        // create filename to be passed to database
        let shopLogoPath = null;
        let shopHeaderPath = null;

        if (req.files.shopHeader) {
          // delete existing image from storage
          if (existingHeaderPath) {
            try {
              fs.unlinkSync(existingHeaderPath);
            } catch (error) {
              console.error("Error updating header image", error);
              return res.status(500).json({ error: "Error Updating Header" });
            }
          }

          const shopHeaderFile = req.files.shopHeader[0];
          const shopHeaderFilename = `${timestamp}_${shopHeaderFile.originalname}`;
          shopHeaderPath = path.join(destinationFolderDB, shopHeaderFilename);
        }

        if (req.files.shopLogo) {
          // delete existing image from storage
          if (existingLogoPath) {
            try {
              fs.unlinkSync(existingLogoPath);
            } catch (err) {
              console.error("Error deleting existing header image:", err);
              res
                .status(500)
                .json({ error: "Error Deleting Previous Header Image" });
            }
          }

          const shopLogoFile = req.files.shopLogo[0];
          const shopLogoFilename = `${timestamp}_${shopLogoFile.originalname}`;
          shopLogoPath = path.join(destinationFolderDB, shopLogoFilename);
        }

        try {
          await Shop.update(
            {
              shop_name: shopName,
              type: shopType,
              description: shopDescription,
              categoryID: productsCategory,
              shipping_deliver_enabled: delivery,
              shipping_pickup_enabled: pickUp,
              address_municipality: addressMunicipality,
              address_postal_code: addressPostalCode,
              address_region: addressRegion,
              address_line_1: addressLine1,
              address_line_2: addressLine2,
              address_barangay: addressBarangay,
              address_province: addressProvince,
              latitude: latitude,
              longitude: longitude,
              phone_number: phoneNumber,
              website_link: shopWebsite,
              is_open_mon: openMonday,
              is_open_tues: openTuesday,
              is_open_wed: openWednesday,
              is_open_thurs: openThursday,
              is_open_fri: openFriday,
              is_open_sat: openSaturday,
              is_open_sun: openSunday,
              time_open: openingTime,
              time_close: closingTime,
              custom_color_hex: hexColor,
              sells_raw_mats: sellsRawMaterials,
              ...(shopLogoPath && { logo_img_link: shopLogoPath }),
              ...(shopHeaderPath && { header_img_link: shopHeaderPath }),
            },
            { where: { shopID: shopID } }
          );
          res
            .status(200)
            .json({ message: "Shop information updated successfully" });
        } catch (error) {
          console.error("Error updating shop:", error);
        }
      }
    );
  },
};
