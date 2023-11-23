const express = require("express");
const router = express.Router();
const controller = require("../controllers/BuyProductController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.post("/add_to_cart", verifyJWT.validateToken, controller.addToCart);
router.patch(
  "/edit_quantity",
  verifyJWT.validateToken,
  controller.editCartItemQuantity
);
router.delete(
  "/delete_cart_item",
  verifyJWT.validateToken,
  controller.deleteCartItem
);
router.patch(
  "/restore_cart_item",
  verifyJWT.validateToken,
  controller.restoreCartItem
);
router.get("/get_cart", verifyJWT.validateToken, controller.getShopperCart);

//ORDER
router.post("/create_order", verifyJWT.validateToken, controller.createOrder);
router.get(
  "/get_all_shop_order",
  verifyJWT.validateToken,
  controller.getAllShopOrders
);

module.exports = router;
