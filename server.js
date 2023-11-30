//initialize packages
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sequelize = require("./config/sequelize");
const verifyJWT = require("./middlewares/ValidateJWT");

const https = require("https");
const fs = require("fs");
// initialize routes
const userRoute = require("./routes/User");
const homeRoute = require("./routes/Home");
const authRoute = require("./routes/Auth");
const refreshRoute = require("./routes/Refresh");
const logoutRoute = require("./routes/Logout");
const profileRoute = require("./routes/Profile");
const shopInfoRoute = require("./routes/ShopInfo");
const categoryRoute = require("./routes/Category");
const shopCategoryRoute = require("./routes/ShopCategory");
const productRoute = require("./routes/Product");
const promoRoute = require("./routes/Promo");
const voucherRoute = require("./routes/Voucher");
const adRoute = require("./routes/Ad");
const employeeRoute = require("./routes/Employee");
const buyProductRoute = require("./routes/BuyProduct");
const customerRoute = require("./routes/Customer");
const registerShopRoute = require("./routes/RegisterShop");
//initalize functions
const app = express();
const port = 8800;

const credentials = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};

//Sync Database with models
// (COMMENTED OUT TO AVOID ALTER TABLES)

// const db = require(`./models`);
// sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("Database tables synced.");
//   })
//   .catch((error) => {
//     console.error("Error syncing database:", error);
//   });

// enable CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
// Parse JSON request bodies
app.use(express.json());
// for Cookies
app.use(cookieParser());
app.use(express.static(`uploads`));

// //check if server is running on port
// app.listen(port, () => {
//   console.log("Server is running on port " + port);
// });

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

// Start server
httpsServer.listen(port, () => {
  console.log(`Server is running on https://localhost:${port}/`);
});

//routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/refresh", refreshRoute);
app.use("/api/logout", logoutRoute);
app.use("/api/shopInfo", shopInfoRoute);
app.use("/api/shop_category", shopCategoryRoute);
app.use("/api/category", categoryRoute);
app.use("/api/product", productRoute);
app.use("/api/promo", promoRoute);
app.use("/api/voucher", voucherRoute);
app.use("/api/ad", adRoute);
app.use("/api/employee", employeeRoute);
app.use("/api/buy_product", buyProductRoute);
app.use("/api/customer", customerRoute);
app.use("/api/register_shop", registerShopRoute);
app.use(verifyJWT.validateToken);
app.use("/api/home", homeRoute);
app.use("/api/profile", profileRoute);
