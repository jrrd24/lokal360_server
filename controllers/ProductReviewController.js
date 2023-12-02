const ProductVariation = require("../models/ProductVariation");
const Review = require("../models/Review");
const Shopper = require("../models/Shopper");
const User = require("../models/User");

module.exports = {
  createReview: async (req, res) => {
    const { productVariationID, shopperID } = req.query;

    try {
      const review = await Review.create({
        shopperID: shopperID,
        prodVariationID: productVariationID,
        rating: req.body.rating,
        review_content: req.body.review_content,
      });

      res.status(200).json({ review });
    } catch (error) {
      console.error("Create Review Error:", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Create Review" });
    }
  },

  getProductReview: async (req, res) => {
    const { productID } = req.query;

    try {
      console.log("PRODID", productID);
      const productReviews = await Review.findAll({
        attributes: ["rating", "review_content", "createdAt"],
        include: [
          {
            model: ProductVariation,
            where: { productID: productID },
            required: true,
            attributes: ["var_name"],
          },
          {
            model: Shopper,
            attributes: ["username"],
            include: [{ model: User, attributes: ["profile_pic"] }],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const flattenedReviews = productReviews.map((review) => {
        const plainReview = review.toJSON();
        return {
          rating: plainReview.rating,
          review_content: plainReview.review_content,
          var_name: plainReview.ProductVariation.var_name,
          username: plainReview.Shopper.username,
          profile_pic: plainReview.Shopper.User.profile_pic,
        };
      });

      res.status(200).json(flattenedReviews);
    } catch (error) {
      console.error("Get All Product Review Error:", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Get All Product Reviews",
      });
    }
  },
};
