const express = require("express");
const router = express.Router();
const controller = require("../controllers/UserController");

router.get("/", controller.getAll);
module.exports = router;
