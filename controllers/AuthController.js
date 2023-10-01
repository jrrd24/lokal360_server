const User = require("../models/User");
const Shopper = require("../models/Shopper");
const bcrypt = require("bcrypt");
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
      res.status(500).json({ error: "Email Already Exists" });
    }
  },

  // login user
  login: async (req, res) => {
    const { email, password } = req.body;

    //find if email (user) exists
    try {
      const user = await User.findOne({ where: { email: email } });
      if (!user) return res.status(401).json({ error: "User Doesn't Exist" });
      // check password
      const dbPassword = user.password;
      const match = await bcrypt.compare(password, dbPassword);
      if (!match) {
        res.status(400).json({ error: "Wrong Username or Password" });
      } else {
        //Create Token
        const tokens = createTokens(user);

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
        res.cookie("refresh-token", refreshToken, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        }); // Add: secure:true in prod (only works for https)

        res.status(200).json({ message: "Logged In", accessToken });
      }
    } catch (err) {
      res.status(400).json({ error: err });
    }
  },

};
