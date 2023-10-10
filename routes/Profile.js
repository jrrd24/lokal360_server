const express = require("express");
const router = express.Router();
const controller = require("../controllers/ProfileController");

router.get("/", controller.getProfile);
module.exports = router;
