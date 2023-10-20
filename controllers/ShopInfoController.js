const Shop = require("../models/Shop");
const Category = require("../models/Category");
const sequelize = require("../config/sequelize");
const path = require("path");
const destinationFolder = "uploads/shop/logoAndHeader";
const destinationFolderDB = "shop/logoAndHeader";
const configureMulter = require("../helpers/MulterConfig");
const upload = configureMulter(destinationFolder);
const fs = require("fs");

module.exports = {
  //get shop info
  getShopInfo: async (req, res) => {
    const { shopID } = req.query;
    try {
      const result = await Shop.findOne({
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

      res.json(result);
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
            } catch (err) {
              console.error("Error deleting existing header image:", err);
              res
                .status(500)
                .json({ error: "Error Deleting Previous Header Image" });
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
