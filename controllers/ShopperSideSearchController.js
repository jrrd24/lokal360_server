const { Sequelize, Op } = require("sequelize");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductVariation = require("../models/ProductVariation");
const Review = require("../models/Review");
const Shop = require("../models/Shop");

module.exports = {
  getSearchResult: async (req, res) => {
    const { query, categoryID, type, prodType, sortType } = req.query;
    // console.log("QUER", query);
    // console.log("CATID", categoryID);
    // console.log(type);

    var productsWhere = {};
    var shopsWhere = {};

    if (query !== "null") {
      productsWhere[Op.or] = [
        { product_name: { [Op.like]: `%${query}%` } },
        { "$Shop.shop_name$": { [Op.like]: `%${query}%` } },
      ];
      shopsWhere.shop_name = { [Op.like]: `%${query}%` };
    }
    if (categoryID !== "null") {
      productsWhere.categoryID = categoryID;
      shopsWhere.categoryID = categoryID;
    }
    if (prodType === "Raw Materials") {
      productsWhere.is_raw_mat = true;
      shopsWhere.sells_raw_mats = true;
    }
    if (prodType === "Finished Products") {
      productsWhere.is_raw_mat = false;
      shopsWhere.sells_raw_mats = false;
    }

    try {
      var productData;
      var shopData;

      if (type !== "Shop") {
        const productResult = await Product.findAndCountAll({
          where: productsWhere,
          include: [
            { model: ProductImage, attributes: ["prod_image"] },
            {
              model: ProductVariation,
              attributes: ["prodVariationID"],
              include: [{ model: Review, attributes: ["rating"] }],
            },
            {
              model: Shop,
              attributes: ["shop_name"],
            },
          ],
          order:
            sortType === "2"
              ? [["createdAt", "DESC"]]
              : Sequelize.literal("rand()"),
        });

        productData = await Promise.all(
          productResult.rows?.map(async (product) => {
            // GET PRICE
            const minVarPrice = await ProductVariation.min("price", {
              where: { productID: product.productID },
            });

            //AMOUNT SOLD
            const prodOrdersCount = await Order.count({
              attributes: ["orderID"],
              where: { status: "Complete" },
              include: [
                {
                  model: OrderItem,
                  attributes: ["orderItemID"],
                  include: [
                    {
                      model: ProductVariation,
                      attributes: ["productID"],
                      where: { productID: product.productID },
                      required: true,
                    },
                  ],
                  required: true,
                },
              ],
              group: ["Order.orderID"],
            });

            const totalCount = prodOrdersCount.reduce(
              (total, order) => total + order.count,
              0
            );

            //AVERAGE RATING
            let averageRating = 0;

            if (product.ProductVariations) {
              const variationsWithReviews = product.ProductVariations.filter(
                (variation) => variation.Reviews && variation.Reviews.length > 0
              );

              if (variationsWithReviews.length > 0) {
                averageRating =
                  variationsWithReviews.reduce((avg, variation) => {
                    const variationReviews = variation.Reviews || [];
                    const variationRatings = variationReviews.map(
                      (review) => review.rating || 0
                    );

                    // Calculate the average rating for each variation
                    const variationAverage =
                      calculateAverageRating(variationRatings);

                    // Accumulate the average ratings for all variations
                    return avg + variationAverage;
                  }, 0) / variationsWithReviews.length;
              }
            }

            return {
              ...product.toJSON(),
              price: minVarPrice,
              orig_price: minVarPrice,
              total_sold: totalCount || 0,
              rating: averageRating,
            };
          })
        );

        if (sortType === "3") {
          productData.sort((a, b) => b.total_sold - a.total_sold);
        }
      }

      if (type !== "Product") {
        const shopResult = await Shop.findAndCountAll({
          attributes: [
            "shopID",
            "shop_name",
            "type",
            "address_municipality",
            "address_barangay",
            "shipping_deliver_enabled",
            "shipping_pickup_enabled",
            "logo_img_link",
            "sells_raw_mats",
            "is_360_partner",
          ],

          where: shopsWhere,
          include: [
            {
              model: Product,
              attributes: ["productID"],
              include: [
                {
                  model: ProductVariation,
                  attributes: ["prodVariationID"],
                  include: [{ model: Review, attributes: ["rating"] }],
                },
              ],
            },
          ],
          order: Sequelize.literal("rand()"),
          limit: type === "Shop" ? undefined : 1,
        });

        shopData = shopResult?.rows.map((shop) => {
          let shopRatingSum = 0;
          let totalProducts = 0;

          shop.Products.forEach((product) => {
            let averageRating = 0;

            if (product.ProductVariations) {
              const variationsWithReviews = product.ProductVariations.filter(
                (variation) => variation.Reviews && variation.Reviews.length > 0
              );

              if (variationsWithReviews.length > 0) {
                averageRating =
                  variationsWithReviews.reduce((avg, variation) => {
                    const variationReviews = variation.Reviews || [];
                    const variationRatings = variationReviews.map(
                      (review) => review.rating || 0
                    );

                    // Calculate the average rating for each variation
                    const variationAverage =
                      calculateAverageRating(variationRatings);

                    // Accumulate the average ratings for all variations
                    return avg + variationAverage;
                  }, 0) / variationsWithReviews.length;

                shopRatingSum += averageRating;
                totalProducts += 1;
              }
            }
          });

          const shopAverageRating =
            totalProducts > 0 ? shopRatingSum / totalProducts : 0;

          return {
            shopID: shop.shopID,
            shop_name: shop.shop_name,
            type: shop.type,
            shipping_deliver_enabled: shop.shipping_deliver_enabled,
            shipping_pickup_enabled: shop.shipping_pickup_enabled,
            logo_img_link: shop.logo_img_link,
            sells_raw_mats: shop.sells_raw_mats,
            is_360_partner: shop.is_360_partner,
            shop_rating: shopAverageRating,
            categoryID: shop.categoryID,
            address: `${shop.address_barangay}, ${shop.address_municipality}`,
          };
        });
      }

      res
        .status(200)
        .json(
          type === "Product"
            ? { productData }
            : type === "Shop"
            ? { shopData }
            : { productData, shopData }
        );
    } catch (error) {
      console.error("Search Error: ", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Return Search Result" });
    }
  },
};

const calculateAverageRating = (ratings) => {
  const validRatings = ratings.filter((rating) => rating !== null);

  return validRatings.length > 0
    ? validRatings.reduce((total, rating) => total + rating, 0) /
        validRatings.length
    : null;
};

const getShopRating = (shop) => {
  let shopRatingSum = 0;
  let totalProducts = 0;

  shop.Products.forEach((product) => {
    let averageRating = 0;

    if (product.ProductVariations) {
      const variationsWithReviews = product.ProductVariations.filter(
        (variation) => variation.Reviews && variation.Reviews.length > 0
      );

      if (variationsWithReviews.length > 0) {
        averageRating =
          variationsWithReviews.reduce((avg, variation) => {
            const variationReviews = variation.Reviews || [];
            const variationRatings = variationReviews.map(
              (review) => review.rating || 0
            );

            // Calculate the average rating for each variation
            const variationAverage = calculateAverageRating(variationRatings);

            // Accumulate the average ratings for all variations
            return avg + variationAverage;
          }, 0) / variationsWithReviews.length;

        shopRatingSum += averageRating;
        totalProducts += 1;
      }
    }
  });

  return totalProducts > 0 ? shopRatingSum / totalProducts : 0;
};
