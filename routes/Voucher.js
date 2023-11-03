const express = require("express");
const router = express.Router();
const controller = require("../controllers/VoucherController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAllShopVoucher);
router.get("/get_all_products", controller.getAllVoucherProducts);
router.get("/get_all_promos", controller.getAllVoucherPromos);
router.post("/create", verifyJWT.validateToken, controller.createVoucher);
router.patch("/update", verifyJWT.validateToken, controller.updateVoucher);
module.exports = router;
