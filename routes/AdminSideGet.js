const express = require("express");
const router = express.Router();
const controller = require("../controllers/AdminSideGetController");
const verifyJWT = require("../middlewares/ValidateJWT");

//TODO: ADD VERIFY ROLE (ADMIN)
router.get("/all_users", controller.getAllUsers);
router.get("/all_categories", controller.getAllCategories);
router.get("/all_sitewide_ads", controller.getAllSitewideAds);
router.get("/all_shops", controller.getAllShops);
router.get("/dashboard", controller.dashboardContent);

module.exports = router;
