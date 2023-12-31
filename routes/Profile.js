const express = require("express");
const router = express.Router();
const controller = require("../controllers/ProfileController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getProfile);
router.get("/dashboard", controller.getUsername);
router.patch("/update", verifyJWT.validateToken, controller.updateProfile);
module.exports = router;
