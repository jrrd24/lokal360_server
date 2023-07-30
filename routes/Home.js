const express = require("express");
const router = express.Router();
const controller = require("../controllers/HomeController");
const { validateToken } = require("../middlewares/ValidateJWT");

router.get("/", validateToken, controller.homepage);
module.exports = router;