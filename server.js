//initialize packages
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const sequelize = require("./config/sequelize");
const verifyJWT = require("./middlewares/ValidateJWT");
// initialize routes
const userRoute = require("./routes/User");
const homeRoute = require("./routes/Home");
const authRoute = require("./routes/Auth");
const refreshRoute = require("./routes/Refresh");
const logoutRoute = require("./routes/Logout");
//initalize functions
const app = express();
const port = 8800;

//Sync Database with models
const db = require(`./models`);
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("Database tables synced.");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

//check if server is running on port
app.listen(port, () => {
  console.log("Server is running on port " + port);
});

// Parse JSON request bodies
app.use(express.json());
// for Cookies
app.use(cookieParser());
// enable CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/refresh", refreshRoute);
app.use("/api/logout", logoutRoute);
app.use(verifyJWT.validateToken);
app.use("/api/home", homeRoute);
