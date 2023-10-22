const express = require("express");
const router = express.Router();
const controller = require("../controllers/ProductController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAllShopProduct);
router.get("/product_info", controller.getProduct);
router.get("/products_count", controller.productCount);
router.post("/create", verifyJWT.validateToken, controller.createProduct);
router.patch("/update", verifyJWT.validateToken, controller.updateProduct);
router.delete("/delete", verifyJWT.validateToken, controller.deleteProduct);
router.patch("/restore", verifyJWT.validateToken, controller.restoreProduct);
module.exports = router;
