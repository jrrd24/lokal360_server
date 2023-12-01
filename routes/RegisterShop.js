const express = require("express");
const router = express.Router();
const controller = require("../controllers/RegisterShopController");
const verifyJWT = require("../middlewares/ValidateJWT");
const verifyRoles = require("../middlewares/VerifyRoles");

router.get("/owner_info", verifyJWT.validateToken, controller.getOwnerInfo);
router.post("/register", verifyJWT.validateToken, controller.registerShop);
router.get(
  "/all_registration",
  verifyJWT.validateToken,
  verifyRoles("admin"),
  controller.displayAllShopRegistration
);
router.get(
  "/registration_details",
  verifyJWT.validateToken,
  verifyRoles("admin"),
  controller.displayShopRegistrationDetails
);
router.patch(
  "/review_registration",
  verifyJWT.validateToken,
  verifyRoles("admin"),
  controller.reviewRegistration
);
module.exports = router;
