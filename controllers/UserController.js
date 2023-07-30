const User = require("../models/User");
const Shopper = require("../models/Shopper");
const bcrypt = require("bcrypt");
const { createTokens } = require("../helpers/JWT");

module.exports = {
  //get all users
  getAll: async (req, res) => {
    try {
      const result = await User.findAll({
        include: [
          {
            model: Shopper,
            required: true,
          }, // Inner join
        ],
      });

      res.json(result); //Return Result
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

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

      // check password
      const dbPassword = user.password;
      bcrypt.compare(password, dbPassword).then((match) => {
        if (!match) {
          res.status(400).json({ error: "Wrong Username or Password" });
        } else {
          //Create Token
          const accessToken = createTokens(user);

          //Set token as cookie
          //Token will expire after 30 days (2592000000 ms)
          res.cookie("access-token", accessToken, {
            httpOnly: false,
            secure: false,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000,
          });
          res.status(200).json({ message: "Logged In", accessToken });
        }
      });
    } catch (err) {
      res.status(400).json({ error: "User Doesn't Exist" });
    }
  },
};
