const express = require("express");
const router = express.Router();
const controller = require("../controllers/HomeController");
const verifyRoles = require("../middlewares/VerifyRoles");

router.get("/", verifyRoles("admin"), controller.homepage);
module.exports = router;
