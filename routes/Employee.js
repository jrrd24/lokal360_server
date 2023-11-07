const express = require("express");
const router = express.Router();
const controller = require("../controllers/EmployeeController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getAllShopEmployee);
router.post("/create", verifyJWT.validateToken, controller.addShopEmployee);
router.patch("/update", verifyJWT.validateToken, controller.editShopEmployee);
router.delete(
  "/delete",
  verifyJWT.validateToken,
  controller.deleteShopEmployee
);
router.patch(
  "/restore",
  verifyJWT.validateToken,
  controller.restoreShopEmployee
);
module.exports = router;
