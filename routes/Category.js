const express = require("express");
const router = express.Router();
const controller = require("../controllers/CategoryController");

router.get("/", controller.getAllCategory);
module.exports = router;
