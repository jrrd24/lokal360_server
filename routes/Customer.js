const express = require("express");
const router = express.Router();
const controller = require("../controllers/CustomerController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", verifyJWT.validateToken, controller.getAllShopCustomer);
router.post("/follow", verifyJWT.validateToken, controller.followShop);
router.delete("/unfollow", verifyJWT.validateToken, controller.unfollowShop);
module.exports = router;
