const express = require("express");
const router = express.Router();
const controller = require("../controllers/VoucherController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAllShopVoucher);
router.get("/get_all_active", controller.getAllActiveShopVoucher);
router.get("/get_all_products", controller.getAllVoucherProducts);
router.get("/get_all_promos", controller.getAllVoucherPromos);
router.post("/create", verifyJWT.validateToken, controller.createVoucher);
router.patch("/update", verifyJWT.validateToken, controller.updateVoucher);
router.delete("/delete", verifyJWT.validateToken, controller.deleteVoucher);
router.patch("/restore", verifyJWT.validateToken, controller.restoreVoucher);
//SHOPPER SIDE
router.post("/claim", verifyJWT.validateToken, controller.claimVoucher);
router.patch(
  "/use_claimed",
  verifyJWT.validateToken,
  controller.useClaimedVoucher
);

module.exports = router;
