const today = new Date();
const { Op, Sequelize } = require("sequelize");
const LokalAds = require("../models/LokalAds");
const Category = require("../models/Category");
const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductVariation = require("../models/ProductVariation");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Review = require("../models/Review");
const Shop = require("../models/Shop");
const ShopCategory = require("../models/ShopCategory");

module.exports = {
  //HOMEPAGE
  getActiveSitewideAds: async (req, res) => {
    try {
      const activeSitewideAds = await LokalAds.findAll({
        where: {
          type: 2,
          status: "Approved",
          start_date: {
            [Op.lte]: today,
          },
          end_date: {
            [Op.gte]: today,
          },
        },
        attributes: ["lokalAdsID", "shopID", "ad_image", "ad_name"],
      });

      res.status(200).json(activeSitewideAds);
    } catch (error) {
      console.error("Get All Active Sitewide Ads:", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Get All Active Sitewide Ads ",
      });
    }
  },

  getAllCategories: async (req, res) => {
    try {
      const allCategories = await Category.findAll();
      res.status(200).json(allCategories);
    } catch (error) {
      console.error("Get All Categories:", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Get All Categories ",
      });
    }
  },

  getAllProducts: async (req, res) => {
    const {
      filter,
      shopID,
      filterShopCategory,
      filterRawMats,
      filterCategoryID,
      filterBestSellers,
      filterNewArrival,
      limit,
    } = req.query;

    const whereClause = filter
      ? { category_name: filter }
      : filterCategoryID
      ? { categoryID: filterCategoryID }
      : {};

    try {
      const allProductsData = await Product.findAll({
        where: shopID
          ? { shopID: shopID }
          : filterRawMats
          ? { is_raw_mat: true }
          : {},
        include: [
          { model: ProductImage, attributes: ["prod_image"] },
          {
            model: ProductVariation,
            attributes: ["prodVariationID"],
            include: [{ model: Review, attributes: ["rating"] }],
            required: true,
          },
          {
            model: Category,
            attributes: ["category_name"],
            where: whereClause,
          },
          {
            model: ShopCategory,
            attributes: [],
            where: filterShopCategory
              ? { shopCategoryID: filterShopCategory }
              : {},
            required: filterShopCategory ? true : false,
          },
        ],
        order: filterBestSellers
          ? undefined
          : filterNewArrival
          ? [["createdAt", "DESC"], [Sequelize.literal("rand()")]]
          : Sequelize.literal("rand()"),
        limit: filterNewArrival && limit ? parseInt(limit) : undefined,
      });

      const allProducts = await Promise.all(
        allProductsData.map(async (product) => {
          // GET PRICE
          const minVarPrice = await ProductVariation.min("price", {
            where: { productID: product.productID },
          });

          //AMOUNT SOLD
          const totalCount = await OrderItem.sum("quantity", {
            where: {
              "$Order.status$": "Complete",
              "$ProductVariation.productID$": product.productID,
            },
            include: [
              {
                model: Order,
                attributes: [],
              },
              {
                model: ProductVariation,
                attributes: [],
              },
            ],
          });

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

      // Order the array by total_sold in descending order
      let limitedSortedProducts;
      if (filterBestSellers) {
        const sortedProducts = allProducts
          .filter((product) => product.total_sold > 0)
          .sort((a, b) => b.total_sold - a.total_sold);
        // Limit to only the first 10 elements
        limitedSortedProducts = sortedProducts.slice(0, parseInt(limit));
      }

      res
        .status(200)
        .json(filterBestSellers ? limitedSortedProducts : allProducts);
    } catch (error) {
      console.error("Get All Products Error", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Get All Products ",
      });
    }
  },

  getAllShops: async (req, res) => {
    const { filter, isRawMat, isPartner } = req.query;
    const whereClause = filter ? { category_name: filter } : {};

    try {
      const allShops = await Shop.findAll({
        attributes: [
          "shopID",
          "shop_name",
          "type",
          "address_municipality",
          "address_barangay",
          "shipping_deliver_enabled",
          "shipping_pickup_enabled",
          "header_img_link",
          "logo_img_link",
          "sells_raw_mats",
          "is_360_partner",
        ],
        where: isRawMat
          ? { sells_raw_mats: true }
          : isPartner
          ? { is_360_partner: true }
          : {},
        include: [
          {
            model: Category,
            where: whereClause,
          },
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
      });

      // INCLUDES SHOP RATING
      const shopData = allShops.map((shop) => {
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
          header_img_link: shop.header_img_link,
          logo_img_link: shop.logo_img_link,
          sells_raw_mats: shop.sells_raw_mats,
          is_360_partner: shop.is_360_partner,
          shop_rating: shopAverageRating,
          category_name: shop.Category.category_name,
          address: `${shop.address_barangay}, ${shop.address_municipality}`,
        };
      });

      res.status(200).json(shopData);
    } catch (error) {
      console.error("Get All Shops Error", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Get All Shops ",
      });
    }
  },

  getShopRating: async (req, res) => {
    const { shopID } = req.query;
    const shop = await Shop.findOne({
      attributes: [
        "shopID",
        "shop_name",
        "type",
        "address_municipality",
        "address_barangay",
        "shipping_deliver_enabled",
        "shipping_pickup_enabled",
        "header_img_link",
        "sells_raw_mats",
        "is_360_partner",
      ],
      where: { shopID: shopID },
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
    });

    const shopRating = getShopRating(shop);

    res.status(200).json(shopRating);
    try {
    } catch (error) {
      console.error("Get Shop Rating Error", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Get Shop Rating ",
      });
    }
  },

  getAllShopCategories: async (req, res) => {
    const { shopID } = req.query;

    try {
      const shopCategories = await ShopCategory.findAll({
        where: { shopID: shopID },
        attributes: ["shop_category_name", "shopCategoryID"],
      });
      res.status(200).json(shopCategories);
    } catch (error) {
      console.error("Get Shop Categories Error", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Get Shop Categories ",
      });
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
