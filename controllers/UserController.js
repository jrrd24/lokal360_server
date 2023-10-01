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
};
