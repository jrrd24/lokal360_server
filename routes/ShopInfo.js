const express = require("express");
const router = express.Router();
const controller = require("../controllers/ShopInfoController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getShopInfo);
router.patch("/update", verifyJWT.validateToken, controller.updateShopInfo);
module.exports = router;
