const User = require("../models/User");
const Shop = require("../models/Shop");
const Shopper = require("../models/Shopper");
const ShopOwner = require("../models/ShopOwner");
const ShopEmployee = require("../models/ShopEmployee");
const bcrypt = require("bcrypt");
const fs = require("fs");
const { createTokens } = require("../helpers/JWT");

module.exports = {
  //register user
  register: async (req, res) => {
    try {
      const { email, password, mobile_num, username } = req.body;

      if (!email || !username || !mobile_num || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert to user table
      const user = await User.create({
        email,
        password: hashedPassword,
        mobile_num,
        status: "Regular",
        user_role: "Shopper",
      });

      //check if userID is generated
      if (!user.userID) {
        return res.status(500).json({ error: "Failed to create user" });
      }

      // Insert to shopper table
      const shopper = await Shopper.create({
        userID: user.userID,
        username,
      });

      res.status(200).json({
        status: "OK",
        user,
        shopper,
      });
    } catch (error) {
      console.error(error);
      res.status(403).json({ error: "Email Already Exists" });
    }
  },

  // login user
  login: async (req, res) => {
    const { email, password } = req.body;

    //find if email (user) exists
    try {
      const user = await User.findOne({ where: { email: email } });
      //handle if there is no user
      if (!user) return res.sendStatus(404);

      // check password
      const dbPassword = user.password;
      const match = await bcrypt.compare(password, dbPassword);
      if (!match) {
        return res.sendStatus(401);
      } else {
        //set roles
        const roles = [];
        if (user.is_shopper) {
          roles.push("shopper");
        }
        if (user.is_shop_owner) {
          roles.push("shop owner");
        }
        if (user.is_shop_employee) {
          roles.push("shop employee");
        }
        if (user.is_admin) {
          roles.push("admin");
        }
        const userID = user.userID;
        //Create Token
        const tokens = createTokens(user);

        //get shopperID
        let shopperID = null;
        try {
          const shopperIDData = await Shopper.findOne({
            where: { userID: userID },
            attributes: ["shopperID"],
          });
          shopperID = shopperIDData.shopperID;
        } catch (error) {
          console.error("Fetch Shopper ID error", error);
          res.status(500).json({ error: "Internal Server Error" });
        }

        // get shop ID (for shop owners and shop employees)
        // will be null if user is not owner or employee
        let userShopID = null;
        let shopID = null;
        try {
          userShopID = await Shop.findAll({
            attributes: ["shopID"],
            include: [
              {
                model: ShopOwner,
                where: { userID: userID },
                attributes: [],
              },
            ],
          });
        } catch (error) {
          console.error("Fetch Shop ID error", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        if (userShopID && userShopID.length > 0) {
          shopID = userShopID[0].shopID;
        }

        let userShopEmployeeID = null;
        let employeePriviledges = {};
        try {
          userShopEmployeeID = await ShopEmployee.findOne({
            where: { userID: userID },
          });
        } catch (error) {
          console.error("Fetch Shop ID error", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
        if (userShopEmployeeID) {
          shopID = userShopEmployeeID.shopID;
          console.log("EMPLOYEE-DATA", userShopEmployeeID);
          const accessRights = {
            accessAnalytics: userShopEmployeeID.access_analytics || false,
            accessProducts: userShopEmployeeID.access_products || false,
            accessCustomers: userShopEmployeeID.access_customers || false,
            accessOrders: userShopEmployeeID.access_orders || false,
            accessShopInformation:
              userShopEmployeeID.access_shop_information || false,
            accessPromos: userShopEmployeeID.access_promos || false,
            accessLokalAds: userShopEmployeeID.access_lokal_ads || false,
            accessVouchers: userShopEmployeeID.access_vouchers || false,
          };

          employeePriviledges = accessRights;
        }

        // Extract the tokens from the returned object
        const accessToken = tokens.accessToken;
        const refreshToken = tokens.refreshToken;

        //Insert Refresh Token to database
        try {
          const foundUserID = user.userID;
          await User.update(
            { token: refreshToken },
            { where: { userID: foundUserID } }
          );
        } catch (error) {
          console.error("Error updating token: ", error);
          res.status(500).json({ error: "Internal Server Error" });
        }

        //Set token as cookie
        //Token will expire after 30 days (2592000000 ms)
        res.cookie("jwt", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        }); // Add: secure:true in prod (only works for https)

        res.status(200).json({
          accessToken,
          roles,
          userID,
          shopperID,
          shopID,
          employeePriviledges,
        });
      }
    } catch (err) {
      res.status(400).json({ error: err });
    }
  },
};
