const express = require("express");
const router = express.Router();
const controller = require("../controllers/CustomerController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", verifyJWT.validateToken, controller.getAllShopCustomer);
router.post("/follow", verifyJWT.validateToken, controller.followShop);
router.delete("/unfollow", verifyJWT.validateToken, controller.unfollowShop);
router.get("/check_follow", controller.checkFollowShop);
module.exports = router;
