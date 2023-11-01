const express = require("express");
const router = express.Router();
const controller = require("../controllers/PromoController");
const verifyJWT = require("../middlewares/ValidateJWT");

//FOR PROMO TYPE
router.get("/get_all_promo_type", controller.getAllPromoType);
router.post(
  "/create_promo_type",
  verifyJWT.validateToken,
  controller.createPromoType
);

//FOR PROMOS
router.post("/create_promo", verifyJWT.validateToken, controller.createPromo);
router.get("/get_all_shop_promo", controller.getAllShopPromos);
router.patch("/update_promo", verifyJWT.validateToken, controller.updatePromo);
router.delete("/delete_promo", verifyJWT.validateToken, controller.deletePromo);
router.patch(
  "/restore_promo",
  verifyJWT.validateToken,
  controller.restorePromo
);

//FOR PROMO PRODUCTS
router.get("/get_promo_products", controller.getAllPromoProducts);

module.exports = router;
