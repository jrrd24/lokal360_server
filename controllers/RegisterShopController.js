const configureMulter = require("../helpers/MulterConfig");
const ShopRegistration = require("../models/ShopRegistration");
const User = require("../models/User");
const path = require("path");
const destinationFolder = "uploads/shop/documents";
const destinationFolderDB = "shop/product";
const fs = require("fs");
const Shop = require("../models/Shop");
const ShopOwner = require("../models/ShopOwner");

module.exports = {
  getOwnerInfo: async (req, res) => {
    const { userID } = req.query;

    try {
      const userInfo = await User.findOne({
        where: { userID: userID },
        attributes: ["first_name", "last_name", "email", "mobile_num"],
      });

      res.status(200).json(userInfo);
    } catch (error) {
      console.error("Get Owner Info Error", error);
      res.status(500).json({
        error: "Internal server error: Cannot Retrieve Owner Information",
      });
    }
  },

  registerShop: async (req, res) => {
    const { userID } = req.query;
    const timestamp = Date.now();
    const upload = configureMulter(destinationFolder, timestamp);

    try {
      upload.fields([
        { name: "BIR_COR" },
        { name: "DTI_COBNR" },
        { name: "DTI_Other" },
        { name: "gov_id_back" },
        { name: "gov_id_front" },
        { name: "products_list" },
      ])(req, res, async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "File upload error" });
        }

        const {
          email,
          firstName,
          lastName,
          phoneNumber,
          productsCategory,
          shopName,
          shopType,
        } = req.body;

        console.log(req.body);

        let BIR_CORPath = null;
        if (req.files.BIR_COR) {
          const BIR_CORFile = req.files.BIR_COR[0];
          const BIR_CORFilename = `${timestamp}_${BIR_CORFile.originalname}`;
          BIR_CORPath = path.join(destinationFolderDB, BIR_CORFilename);
        }

        let DTI_COBNRPath = null;
        if (req.files.DTI_COBNR) {
          const DTI_COBNRFile = req.files.DTI_COBNR[0];
          const DTI_COBNRFilename = `${timestamp}_${DTI_COBNRFile.originalname}`;
          DTI_COBNRPath = path.join(destinationFolderDB, DTI_COBNRFilename);
        }

        let DTI_OtherPath = null;
        if (req.files.DTI_Other) {
          const DTI_OtherFile = req.files.DTI_Other[0];
          const DTI_OtherFilename = `${timestamp}_${DTI_OtherFile.originalname}`;
          DTI_OtherPath = path.join(destinationFolderDB, DTI_OtherFilename);
        }

        let gov_id_backPath = null;
        if (req.files.gov_id_back) {
          const gov_id_backFile = req.files.gov_id_back[0];
          const gov_id_backFilename = `${timestamp}_${gov_id_backFile.originalname}`;
          gov_id_backPath = path.join(destinationFolderDB, gov_id_backFilename);
        }

        let gov_id_frontPath = null;
        if (req.files.gov_id_front) {
          const gov_id_frontFile = req.files.gov_id_front[0];
          const gov_id_frontFilename = `${timestamp}_${gov_id_frontFile.originalname}`;
          gov_id_frontPath = path.join(
            destinationFolderDB,
            gov_id_frontFilename
          );
        }

        let products_listPath = null;
        if (req.files.products_list) {
          const products_listFile = req.files.products_list[0];
          const products_listFilename = `${timestamp}_${products_listFile.originalname}`;
          products_listPath = path.join(
            destinationFolderDB,
            products_listFilename
          );
        }

        console.log("BIR_COR Path:", BIR_CORPath);
        console.log("DTI_COBNR Path:", DTI_COBNRPath);
        console.log("DTI_Other Path:", DTI_OtherPath);
        console.log("gov_id_back Path:", gov_id_backPath);
        console.log("gov_id_front Path:", gov_id_frontPath);
        console.log("products_list Path:", products_listPath);

        await User.update(
          { first_name: firstName, last_name: lastName },
          { where: { userID: userID } }
        );

        const registration = await ShopRegistration.create({
          userID: userID,
          shop_name: shopName,
          shop_type: shopType,
          categoryID: productsCategory,
          attachment_DTI_CBNR: DTI_COBNRPath ? DTI_COBNRPath : null,
          attachment_DTI_other: DTI_OtherPath ? DTI_OtherPath : null,
          attachment_BIR_COR: BIR_CORPath ? BIR_CORPath : null,
          attachment_valid_id_front: gov_id_frontPath ? gov_id_frontPath : null,
          attachment_valid_id_back: gov_id_backPath ? gov_id_backPath : null,
          attachment_products_list: products_listPath
            ? products_listPath
            : null,
          status: "Pending Approval",
          message: null,
          resolution_at: null,
          contact_email: email,
          contact_number: phoneNumber,
        });
      });

      res
        .status(200)
        .json({ message: "Shop Registration Created Successfully" });
    } catch (error) {
      console.error("Create Shop Registration Error:", error);
      res.status(500).json({
        error: "Internal Server Error: Shop Registration Sumbission Failed",
      });
    }
  },

  displayAllShopRegistration: async (req, res) => {
    try {
      const allShopRegistration = await ShopRegistration.findAll({
        include: {
          model: User,
          attributes: ["first_name", "last_name", "profile_pic"],
        },
      });

      res.status(200).json(allShopRegistration);
    } catch (error) {
      console.error("Display All Shop Registrations Error:", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Display All Shop Registrations ",
      });
    }
  },

  displayShopRegistrationDetails: async (req, res) => {
    const { shopRegistrationID } = req.query;

    try {
      const registrationDetails = await ShopRegistration.findOne({
        where: {
          shopRegistrationID: shopRegistrationID,
        },
        include: {
          model: User,
          attributes: ["first_name", "last_name", "profile_pic"],
        },
      });

      res.status(200).json(registrationDetails);
    } catch (error) {
      console.error("Display Shop Registration Details Error:", error);
      res.status(500).json({
        error:
          "Internal Server Error: Cannot Display Shop Registration Details",
      });
    }
  },

  reviewRegistration: async (req, res) => {
    const { shopRegistrationID } = req.query;

    try {
      const updateReg = await ShopRegistration.update(
        {
          status: req.body.status,
          message: req.body.message,
          resolution_at: new Date(),
        },
        { where: { shopRegistrationID: shopRegistrationID } }
      );

      if (req.body.status === "Approved" && updateReg) {
        const registrationDetails = await ShopRegistration.findOne({
          where: {
            shopRegistrationID: shopRegistrationID,
          },
        });
        const shopOwner = await ShopOwner.create({
          userID: registrationDetails.userID,
        });

        if (shopOwner.shopOwnerID) {
          await User.update(
            { is_shop_owner: true },
            { where: { userID: shopOwner.userID } }
          );

          const shopCreationResult = await Shop.create({
            shopOwnerID: shopOwner.shopOwnerID,
            shop_name: registrationDetails.shop_name,
            type: registrationDetails.shop_type,
            categoryID: registrationDetails.categoryID,
          });
          if (shopCreationResult) {
            res.status(200).json({ shopOwner, shopCreationResult });
          } else {
            res.status(500).json({ error: "Shop Creation Failed" });
          }
        } else {
          res.status(500).json({ error: "Shop Owner Creation Failed" });
        }
      } else {
        res.status(200).json({ message: "Shop Approval Rejected" });
      }
    } catch (error) {
      console.error("Review Shop Registration Error:", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Review Shop Registration ",
      });
    }
  },
};
