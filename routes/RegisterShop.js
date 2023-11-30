const express = require("express");
const router = express.Router();
const controller = require("../controllers/RegisterShopController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/owner_info", verifyJWT.validateToken, controller.getOwnerInfo);
router.post("/register", verifyJWT.validateToken, controller.registerShop);
module.exports = router;
