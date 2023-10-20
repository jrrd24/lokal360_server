const express = require("express");
const router = express.Router();
const controller = require("../controllers/ProductController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAllProduct);
router.get("/products_count", controller.productCount);
router.post("/create", verifyJWT.validateToken, controller.createProduct);

module.exports = router;
