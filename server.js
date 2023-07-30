//initialize packages
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// initialize routes
const userRoute = require("./routes/User");
const homeRoute = require("./routes/Home");
//initalize functions
const app = express();
const port = 8800;

//check if server is running on port
app.listen(port, () => {
  console.log("Server is running on port " + port);
});

// Parse JSON request bodies
app.use(express.json());
// for JWT
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
app.use("/api/home", homeRoute);
