const Category = require("../models/Category");

module.exports = {
  //get all categories
  getAllCategory: async (req, res) => {
    try {
      const result = await Category.findAll();

      res.json(result); //Return Result
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
