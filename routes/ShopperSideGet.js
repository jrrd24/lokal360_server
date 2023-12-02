const express = require("express");
const router = express.Router();
const controller = require("../controllers/ShopperSideGetController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/active_sitewide_ads", controller.getActiveSitewideAds);
router.get("/all_categories", controller.getAllCategories);
router.get("/all_products", controller.getAllProducts);
router.get("/all_shops", controller.getAllShops);
module.exports = router;
