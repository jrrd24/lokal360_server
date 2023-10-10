const express = require("express");
const router = express.Router();
const controller = require("../controllers/ShopInfoController");

router.get("/", controller.getShopInfo);
module.exports = router;
