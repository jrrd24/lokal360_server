const express = require("express");
const router = express.Router();
const controller = require("../controllers/ProductReviewController");
const verifyJWT = require("../middlewares/ValidateJWT");
const verifyRoles = require("../middlewares/VerifyRoles");

router.post(
  "/create",
  verifyJWT.validateToken,
  verifyRoles("shopper"),
  controller.createReview
);

router.get(
  "/reviews/product",
  verifyJWT.validateToken,
  verifyRoles("shop owner", "shop employee"),
  controller.getProductReview
);
module.exports = router;
