const express = require("express");
const router = express.Router();
const controller = require("../controllers/ProductController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAllShopProduct);
router.get("/product_info", controller.getProduct);
router.post("/create", verifyJWT.validateToken, controller.createProduct);
router.patch("/update", verifyJWT.validateToken, controller.updateProduct);
router.delete("/delete", verifyJWT.validateToken, controller.deleteProduct);
router.patch("/restore", verifyJWT.validateToken, controller.restoreProduct);
//For featured products
router.get("/get_all_featured", controller.getAllFeatured);
router.patch(
  "/update_featured",
  verifyJWT.validateToken,
  controller.updateFeatured
);
//For top products
router.get("/top_products", controller.getTopProducts);
//For Product Statis Count
router.get("/prod_status_count", controller.getProductStatusCount);
//For Product Variation
router.post(
  "/variation/create",
  verifyJWT.validateToken,
  controller.createVariation
);
router.patch(
  "/variation/update",
  verifyJWT.validateToken,
  controller.updateVariation
);
router.delete(
  "/variation/delete",
  verifyJWT.validateToken,
  controller.deleteVariation
);
router.patch(
  "/variation/restore",
  verifyJWT.validateToken,
  controller.restoreVariation
);
//For Search
router.get("/shop_mgmt/search", controller.searchProductShopMgmt);
module.exports = router;
