const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAll);

//FOR DELIVERY ADDRESS
router.post(
  "/create_delivery_address",
  verifyJWT.validateToken,
  controller.createDeliveryAddress
);
router.delete(
  "/delete_delivery_address",
  verifyJWT.validateToken,
  controller.deleteDeliveryAddress
);
router.patch(
  "/restore_delivery_address",
  verifyJWT.validateToken,
  controller.restoreDeliveryAddress
);
router.patch(
  "/set_active_address",
  verifyJWT.validateToken,
  controller.setActiveDeliveryAddress
);
router.get(
  "/get_shopper_address",
  verifyJWT.validateToken,
  controller.getAllDeliveryAddress
);

module.exports = router;
