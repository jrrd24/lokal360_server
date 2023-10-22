const express = require("express");
const router = express.Router();
const controller = require("../controllers/ShopCategoryController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAllShopCategory);
router.post("/create", verifyJWT.validateToken, controller.createShopCategory);
router.delete(
  "/delete",
  verifyJWT.validateToken,
  controller.deleteShopCategory
);
router.patch(
  "/restore",
  verifyJWT.validateToken,
  controller.restoreShopCategory
);
router.patch("/update", verifyJWT.validateToken, controller.updateShopCategory);
module.exports = router;
