const express = require("express");
const router = express.Router();
const controller = require("../controllers/ShopInfoController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getShopInfo);
router.patch("/update", verifyJWT.validateToken, controller.updateShopInfo);
router.patch(
  "/set_coordinates",
  verifyJWT.validateToken,
  controller.setCoordinates
);
module.exports = router;
