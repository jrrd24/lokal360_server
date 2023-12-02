const express = require("express");
const router = express.Router();
const controller = require("../controllers/AdController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/get_all", controller.getAllShopAd);
router.post("/create", verifyJWT.validateToken, controller.createAd);
router.delete("/delete", verifyJWT.validateToken, controller.deleteAd);
router.patch("/restore", verifyJWT.validateToken, controller.restoreAd);
router.get("/status_count", controller.countAdStatus);
router.get("/get_active_shop_ads", controller.getActiveShopAds);
router.get("/sitewide/get_pending", controller.getPendingSitewideAds);
router.patch("/approval", verifyJWT.validateToken, controller.reviewAdApproval);
module.exports = router;
