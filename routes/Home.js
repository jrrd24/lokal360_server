const express = require("express");
const router = express.Router();
const controller = require("../controllers/HomeController");

router.get("/", controller.homepage);
module.exports = router;
