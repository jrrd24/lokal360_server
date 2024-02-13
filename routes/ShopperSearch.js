const express = require("express");
const router = express.Router();
const controller = require("../controllers/ShopperSideSearchController");
const verifyJWT = require("../middlewares/ValidateJWT");

router.get("/", controller.getSearchResult);
module.exports = router;
