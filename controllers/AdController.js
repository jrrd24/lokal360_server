const LokalAds = require("../models/LokalAds");
const path = require("path");
const destinationFolder = "uploads/shop/ads";
const destinationFolderDB = "shop/ads";
const configureMulter = require("../helpers/MulterConfig");
const upload = configureMulter(destinationFolder);
const fs = require("fs");
const { Op } = require("sequelize");
const Shop = require("../models/Shop");
const today = new Date();

module.exports = {
  getAllShopAd: async (req, res) => {
    const { shopID } = req.query;

    try {
      const allShopAdData = await LokalAds.findAll({
        where: { shopID: shopID },
        attributes: [
          "lokalAdsID",
          "shopID",
          "ad_name",
          "ad_image",
          "start_date",
          "end_date",
          "type",
          "status",
          "message",
        ],
      });

      const allShopAd = allShopAdData.map((ad) => {
        const startDate = new Date(ad.start_date);
        const endDate = new Date(ad.end_date);
        const currentDate = new Date();

        const isActive = currentDate >= startDate && currentDate <= endDate;
        const isExpired = currentDate > endDate;
        return {
          lokalAdsID: ad.lokalAdsID,
          shopID: ad.shopID,
          ad_name: ad.ad_name,
          start_date: startDate,
          end_date: endDate,
          approved_at: ad.type === 1 ? "N/A" : ad.approved_at,
          type: ad.type,
          status:
            ad.type === 1 && isActive
              ? "Active"
              : ad.type === 2 && ad.status === "Approved" && isActive
              ? "Active"
              : isExpired
              ? "Expired"
              : ad.status,
          message: ad.message,
          ad_image: ad.ad_image,
          is_active: isActive,
        };
      });

      //SORT ADS
      const statusOrder = {
        Active: 1,
        Approved: 2,
        "Pending Approval": 3,
        Rejected: 4,
        Expired: 5,
      };

      const sortedShopAds = allShopAd.sort((a, b) => {
        const statusA = statusOrder[a.status];
        const statusB = statusOrder[b.status];
        return statusA - statusB;
      });

      res.status(200).json(sortedShopAds);
    } catch (error) {
      console.error("Get All Shop Lokal Ads Error", error);
      res.sendStatus(500);
    }
  },

  createAd: async (req, res) => {
    const { shopID } = req.query;

    const timestamp = Date.now();
    const upload = configureMulter(destinationFolder, timestamp);

    upload.fields([{ name: "adImage" }])(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "File upload error" });
      }

      // SET START AND END TIME FOR VOUCHER EXPIRATION
      const startDateTime = new Date(req.body?.startDate);
      const endDateTime = new Date(req.body?.endDate);

      // SET START TO 12 AM END TO 11:59 PM (ADJUST TO TRIMEZONE)
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);
      const timezoneOffset = startDateTime.getTimezoneOffset();
      startDateTime.setMinutes(startDateTime.getMinutes() - timezoneOffset);
      endDateTime.setMinutes(endDateTime.getMinutes() - timezoneOffset);

      const { adName, adType } = req.body;
      const adTypeNumber = parseInt(adType, 10);
      let adImagePath = null;

      if (req.files.adImage) {
        const adImageFile = req.files.adImage[0];
        const adImageFilename = `${timestamp}_${adImageFile.originalname}`;
        adImagePath = path.join(destinationFolderDB, adImageFilename);

        console.log(adImageFile, adImageFilename);
      }

      console.log("IMG-PATH", adImagePath);

      try {
        const [ad, created] = await LokalAds.findOrCreate({
          where: { shopID: shopID, ad_name: adName },
          defaults: {
            shopID: shopID,
            ad_name: adName,
            start_date: startDateTime,
            end_date: endDateTime,
            type: adTypeNumber,
            ad_image: adImagePath ? adImagePath : null,
            status: adTypeNumber === 1 ? "Approved" : "Pending Approval",
          },
        });

        if (created) {
          res
            .status(200)
            .json({ message: "New Lokal Ad Created Successfully" });
        } else {
          res.status(409).json({ error: "Lokal Ad Already Exists" });
        }
      } catch (error) {
        console.error("Create Lokal Ad Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  },

  deleteAd: async (req, res) => {
    const { lokalAdsID } = req.query;

    try {
      await LokalAds.destroy({
        where: { lokalAdsID: lokalAdsID },
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Delete Lokal Ad Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  restoreAd: async (req, res) => {
    const { lokalAdsID } = req.query;

    try {
      await LokalAds.restore({
        where: { lokalAdsID: lokalAdsID },
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Lokal Ad Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  countAdStatus: async (req, res) => {
    const { shopID } = req.query;

    try {
      const allAds = await LokalAds.findAll({
        where: { shopID: shopID },
        attributes: ["lokalAdsID", "type", "status", "start_date", "end_date"],
      });

      //GET STATUS COUNT
      let activeCount = 0;
      let approvedCount = 0;
      let pendingCount = 0;
      let rejectedCount = 0;
      let expiredCount = 0;

      await Promise.all(
        allAds.map(async (ad) => {
          const startDate = new Date(ad.start_date);
          const endDate = new Date(ad.end_date);
          const currentDate = new Date();

          const isActive = currentDate >= startDate && currentDate <= endDate;
          const isExpired = currentDate > endDate;

          if (ad.type === 1 && isActive) {
            activeCount++;
          } else if (ad.type === 1 && isExpired) {
            expiredCount++;
          } else if (ad.type === 2 && ad.status === "Approved" && isActive) {
            activeCount++;
          } else if (
            ad.type === 2 &&
            ad.status === "Pending Approval" &&
            isExpired
          ) {
            expiredCount++;
          } else if (ad.type === 2 && ad.status === "Pending Approval") {
            pendingCount++;
          } else if (ad.type === 2 && ad.status === "Rejected") {
            rejectedCount++;
          } else if (ad.type === 2 && isExpired) {
            expiredCount++;
          } else if (ad.status === "Approved") {
            approvedCount++;
          }
        })
      );

      const statusCounts = {
        active: activeCount,
        approved: approvedCount,
        pendingApproval: pendingCount,
        rejected: rejectedCount,
        expired: expiredCount,
      };

      res.status(200).json(statusCounts);
    } catch (error) {
      console.error("Get Lokal Ads Status Count Error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  getActiveShopAds: async (req, res) => {
    const { shopID } = req.query;

    try {
      const allAds = await LokalAds.findAll({
        where: { shopID: shopID, status: "Approved" },
        attributes: [
          "lokalAdsID",
          "ad_name",
          "type",
          "status",
          "start_date",
          "end_date",
          "ad_image",
        ],
      });

      const activeAds = allAds.filter((ad) => {
        const startDate = new Date(ad.start_date);
        const endDate = new Date(ad.end_date);
        const currentDate = new Date();

        const isActive = currentDate >= startDate && currentDate <= endDate;
        return isActive;
      });

      const activeShopAds = activeAds.map((ad) => ({
        lokalAdsID: ad.lokalAdsID,
        ad_name: ad.ad_name,
        ad_image: ad.ad_image,
        start_date: ad.start_date,
      }));

      res.status(200).json(activeShopAds);
    } catch (error) {
      console.error("Get Active Shop Ads Error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //AD APPROVAL
  getPendingSitewideAds: async (req, res) => {
    try {
      const allSitewideAds = await LokalAds.findAll({
        where: {
          type: 2,
          status: "Pending Approval",
          start_date: {
            [Op.gte]: today,
          },
        },
        attributes: [
          "lokalAdsID",
          "shopID",
          "ad_name",
          "ad_image",
          "start_date",
          "end_date",
          "type",
          "status",
          "message",
        ],
        include: [{ model: Shop, attributes: ["shop_name"] }],
      });
      res.status(200).json(allSitewideAds);
    } catch (error) {
      console.error("Get All Sitewide Ads", error);
      res.status(500).json({
        error: "Internal server error: Cannot Retrieve All Sitewide Ads",
      });
    }
  },

  reviewAdApproval: async (req, res) => {
    const { lokalAdsID } = req.query;
    let currentDate = null;

    if (req.body.status === "Approved") {
      currentDate = new Date();
    }

    try {
      const updateAdStatus = await LokalAds.update(
        {
          status: req.body.status,
          message: req.body.message,
          approved_at: currentDate,
        },
        { where: { lokalAdsID: lokalAdsID } }
      );

      res.status(200).json(updateAdStatus);
    } catch (error) {
      console.error("Review Ad Approval Error", error);
      res.status(500).json({
        error: "Internal server error: Cannot Review Ad Approval",
      });
    }
  },
};
