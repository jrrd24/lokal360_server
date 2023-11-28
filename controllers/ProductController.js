const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductVariation = require("../models/ProductVariation");
const VoucherAppliedProduct = require("../models/VoucherAppliedProduct");
const Shop = require("../models/Shop");
const path = require("path");
const destinationFolder = "uploads/shop/product";
const destinationFolderDB = "shop/product";
const destinationFolderVar = "uploads/shop/variation";
const destinationFolderVarDB = "shop/variation";
const configureMulter = require("../helpers/MulterConfig");
const upload = configureMulter(destinationFolder);
const fs = require("fs");
const sequelize = require("../config/sequelize");
const ShopCategory = require("../models/ShopCategory");
const Category = require("../models/Category");
const { Op } = require("sequelize");
const Promo = require("../models/Promo");
const PromoType = require("../models/PromoType");
const Voucher = require("../models/Voucher");

module.exports = {
  // get data of all products of shop
  getAllShopProduct: async (req, res) => {
    const { shopID } = req.query;
    try {
      const allProductsData = await Product.findAll({
        where: { shopID: shopID },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      //GET STATUS COUNT
      const allProducts = await Promise.all(
        allProductsData.map(async (product) => {
          const inStock = await ProductVariation.count({
            where: { productID: product.productID, status: "In Stock" },
          });
          const lowStock = await ProductVariation.count({
            where: { productID: product.productID, status: "Low Stock" },
          });
          const outOfStock = await ProductVariation.count({
            where: { productID: product.productID, status: "Out Of Stock" },
          });

          let prodStatus = "Discontinued";
          if (outOfStock >= 1) {
            prodStatus = "Out Of Stock";
          } else if (lowStock >= 1) {
            prodStatus = "Low Stock";
          } else if (inStock >= 1) {
            prodStatus = "In Stock";
          }

          //GET TOTAL SOLD FROM VAR
          const varTotalSold = await ProductVariation.sum("amt_sold", {
            where: { productID: product.productID },
          });

          // Add status property to the product object
          return {
            ...product.toJSON(),
            status: prodStatus,
            total_sold: varTotalSold || 0,
          };
        })
      );

      res.status(200).json(allProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // get data of one product
  getProduct: async (req, res) => {
    const { productID } = req.query;
    try {
      const product = await Product.findOne({
        where: { productID: productID },

        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
          { model: ShopCategory, attributes: ["shop_category_name"] },
          { model: Category, attributes: ["category_name"] },
          {
            model: Promo,
            attributes: [
              "promoID",
              "promoTypeID",
              "discount_amount",
              "min_spend",
            ],
            include: [{ model: PromoType, attributes: ["promo_type_name"] }],
            required: false,
          },
          { model: ProductVariation, required: false },
          {
            model: VoucherAppliedProduct,
            required: false,
            attributes: ["voucherAppliedProductID"],
            include: [
              {
                model: Voucher,
                attributes: ["end_date", "start_date"],
                include: [
                  {
                    model: Promo,
                    attributes: ["discount_amount", "min_spend"],
                    include: [
                      {
                        model: PromoType,
                        attributes: ["promo_type_name"],
                      },
                    ],
                  },
                  { model: Shop, attributes: ["shop_name", "logo_img_link"] },
                ],
              },
            ],
          },
        ],
      });

      if (product) {
        //GET PRODUCT STATUS
        const inStock = await ProductVariation.count({
          where: { productID: product.productID, status: "In Stock" },
        });
        const lowStock = await ProductVariation.count({
          where: { productID: product.productID, status: "Low Stock" },
        });
        const outOfStock = await ProductVariation.count({
          where: { productID: product.productID, status: "Out Of Stock" },
        });

        let prodStatus = "Discontinued";
        if (outOfStock >= 1) {
          prodStatus = "Out Of Stock";
        } else if (lowStock >= 1) {
          prodStatus = "Low Stock";
        } else if (inStock >= 1) {
          prodStatus = "In Stock";
        }

        // GET NUMBER OF VARIATIONS
        const variationCount = await ProductVariation.count({
          where: { productID: productID },
        });

        // GET MIN PRICE
        const minVarPrice = await ProductVariation.min("price", {
          where: { productID: productID },
        });

        //GET TOTAL SOLD FROM VAR
        const varTotalSold = await ProductVariation.sum("amt_sold", {
          where: { productID: productID },
        });

        //GET TOTAL SALES
        product.dataValues.total_sold = varTotalSold;
        product.dataValues.price = minVarPrice;
        product.dataValues.prod_status = prodStatus;
        product.dataValues.number_of_variations = variationCount;

        res.status(200).json(product);
      } else {
        res.status(404).json({ error: "No Product Data Found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // get product count
  productCount: async (req, res) => {
    const { shopID } = req.query;
    try {
      const prodCount = await Product.findAll({
        where: { shopID: shopID },
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("productID")), "noOfProducts"],
        ],
      });
      res.json(prodCount);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  createProduct: async (req, res) => {
    const { shopID } = req.query;

    const timestamp = Date.now();
    const upload = configureMulter(destinationFolder, timestamp);

    upload.fields([{ name: "productThumbnail" }])(
      req,
      res,
      async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "File upload error" });
        }

        const {
          productCategory,
          productDescription,
          productName,
          shopCategory,
        } = req.body;

        let productThumbnailPath = null;

        if (req.files.productThumbnail) {
          const productThumbnailFile = req.files.productThumbnail[0];
          const productThumbnailFilename = `${timestamp}_${productThumbnailFile.originalname}`;
          productThumbnailPath = path.join(
            destinationFolderDB,
            productThumbnailFilename
          );
        }
        try {
          const [product, created] = await Product.findOrCreate({
            where: {
              product_name: productName,
              shopID: shopID,
            },
            defaults: {
              categoryID: productCategory,
              shopID: shopID,
              shopCategoryID: shopCategory,
              product_name: productName,
              description: productDescription,
            },
          });

          // adds thumbnail if included in req
          if (productThumbnailPath) {
            await ProductImage.create({
              productID: product.productID,
              prod_image: productThumbnailPath,
              is_thumbnail: true,
            });
          }
          // check if product exists
          if (created) {
            res
              .status(200)
              .json({ message: "New Product Created Successfully" });
          } else {
            res.status(409).json({ error: "Product Already Exists" });
          }
        } catch (error) {
          console.error("Create Product Error:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    );
  },

  updateProduct: async (req, res) => {
    const { productID } = req.query;

    // get current image path
    let currentProductImage = null;
    try {
      currentProductImage = await ProductImage.findOne({
        where: { productID: productID, is_thumbnail: true },
        attributes: ["prod_image"],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Cannot Retrieve Product Thumbnail" });
    }

    let existingThumbnailPath = null;
    if (currentProductImage) {
      existingThumbnailPath = `uploads/${currentProductImage?.prod_image}`;
    }

    // upload image
    const timestamp = Date.now();
    const upload = configureMulter(destinationFolder, timestamp);

    upload.fields([{ name: "productThumbnail" }])(
      req,
      res,
      async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "File upload error" });
        }

        const { category, productDescription, productName, shopCategory } =
          req.body;

        // thumbnail path for db
        let thumbnailPath = null;
        if (req.files.productThumbnail) {
          // delete existing image from storage
          if (existingThumbnailPath) {
            try {
              fs.unlinkSync(existingThumbnailPath);
            } catch (error) {
              console.error("Error updating thumbnail", error);
              return res
                .status(500)
                .json({ error: "Error Updating Thumbnail" });
            }
          }
          const thumbnailFile = req.files.productThumbnail[0];
          const thumbnailFilename = `${timestamp}_${thumbnailFile.originalname}`;
          thumbnailPath = path.join(destinationFolderDB, thumbnailFilename);
        }

        //update product table
        try {
          await Product.update(
            {
              categoryID: category,
              description: productDescription,
              product_name: productName,
              shopCategoryID: shopCategory,
            },
            { where: { productID: productID } }
          );

          if (thumbnailPath && currentProductImage) {
            await ProductImage.update(
              { prod_image: thumbnailPath },
              { where: { productID: productID } }
            );
          } else if (thumbnailPath && !currentProductImage) {
            await ProductImage.create({
              productID: productID,
              prod_image: thumbnailPath,
              is_thumbnail: true,
            });
          }

          res.status(200).json({ message: "Product updated successfully" });
        } catch (error) {
          console.error("Error updating Product:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    );
  },

  deleteProduct: async (req, res) => {
    const { productID } = req.query;

    try {
      await Product.destroy({
        where: {
          productID: productID,
        },
      });

      await ProductImage.destroy({
        where: {
          productID: productID,
        },
      });
      return res.sendStatus(200);
    } catch (error) {
      console.error("Delete Product Error: ", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Delete Product Failed" });
    }
  },

  restoreProduct: async (req, res) => {
    const { productID } = req.query;
    try {
      await Product.restore({ where: { productID: productID } });
      await ProductImage.restore({ where: { productID: productID } });
      return res.sendStatus(200);
    } catch (error) {
      console.error("Restore Product Error: ", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Restore Product" });
    }
  },

  //For Featured
  getAllFeatured: async (req, res) => {
    const { shopID } = req.query;
    try {
      const allFeaturedData = await Product.findAll({
        where: { shopID: shopID, is_featured: true },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });

      const allNotFeatured = await Product.findAll({
        where: { shopID: shopID, is_featured: false },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });

      const allFeatured = await Promise.all(
        allFeaturedData.map(async (product) => {
          // GET PRICE
          const minVarPrice = await ProductVariation.min("price", {
            where: { productID: product.productID },
          });

          //GET TOTAL SOLD FROM VAR
          const varTotalSold = await ProductVariation.sum("amt_sold", {
            where: { productID: product.productID },
          });

          // TODO: EDIT THIS TO ALSO INCLUDE DISCOUNTED PRICE
          return {
            ...product.toJSON(),
            price: minVarPrice,
            orig_price: minVarPrice,
            total_sold: varTotalSold,
          };
        })
      );

      res.status(200).json({ allFeatured, allNotFeatured });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Retrieve Products" });
    }
  },

  updateFeatured: async (req, res) => {
    console.log(req.body);
    try {
      await Product.update(
        { is_featured: true },
        { where: { productID: { [Op.in]: req.body.featuredProducts } } }
      );

      await Product.update(
        { is_featured: false },
        { where: { productID: { [Op.in]: req.body.notFeaturedProducts } } }
      );
      res.sendStatus(200);
    } catch (error) {
      console.error("add to featured error", error);
      res.status(500).json({
        error: "Internal Server Error: Cannot Update Featured Products",
      });
    }
  },

  //For Top Products
  getTopProducts: async (req, res) => {
    const { shopID } = req.query;

    try {
      const topProductsData = await Product.findAll({
        limit: 5,
        order: [
          [
            sequelize.literal(
              "(SELECT SUM(`ProductVariations`.`amt_sold`) FROM `product_variation` AS `ProductVariations` WHERE `ProductVariations`.`productID` = `Product`.`productID`)"
            ),
            "DESC",
          ],
        ],
        where: { shopID: shopID },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });

      const topProducts = await Promise.all(
        topProductsData.map(async (product) => {
          //GET TOTAL SOLD FROM VAR
          const varTotalSold = await ProductVariation.sum("amt_sold", {
            where: { productID: product.productID },
          });

          // Add status property to the product object
          return {
            ...product.toJSON(),
            total_sold: varTotalSold || 0,
          };
        })
      );

      res.status(200).json({ topProducts });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Retrieve Top Products" });
    }
  },

  //For Product Status Summary
  getProductStatusCount: async (req, res) => {
    const { shopID } = req.query;

    try {
      const allProductsData = await Product.findAll({
        where: { shopID: shopID },
        attributes: ["productID"],
      });

      //GET STATUS COUNT
      let inStockCount = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;
      let discontinuedCount = 0;

      await Promise.all(
        allProductsData.map(async (product) => {
          const inStock = await ProductVariation.count({
            where: { productID: product.productID, status: "In Stock" },
          });
          const lowStock = await ProductVariation.count({
            where: { productID: product.productID, status: "Low Stock" },
          });
          const outOfStock = await ProductVariation.count({
            where: { productID: product.productID, status: "Out Of Stock" },
          });
          const discontinued = await ProductVariation.count({
            where: {
              productID: product.productID,
              deletedAt: { [Op.ne]: null },
            },
            paranoid: false, // Include soft deleted records
          });

          inStockCount += inStock;
          lowStockCount += lowStock;
          outOfStockCount += outOfStock;
          discontinuedCount += discontinued;
        })
      );

      const statusSummary = {
        in_stock_count: inStockCount,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        discontinued_count: discontinuedCount,
      };

      res.status(200).json(statusSummary);
    } catch (error) {
      console.error("Get Product Status Count Error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //For Product Variations
  createVariation: async (req, res) => {
    const { productID } = req.query;

    const timestamp = Date.now();
    const upload = configureMulter(destinationFolderVar, timestamp);

    upload.fields([{ name: "variationThumbnail" }])(
      req,
      res,
      async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "File upload error" });
        }

        const { amountOnHand, price, variationName } = req.body;
        let variationThumbnailPath = null;
        if (req.files.variationThumbnail) {
          const variationThumbnailFile = req.files.variationThumbnail[0];
          const variationThumbnailFilename = `${timestamp}_${variationThumbnailFile.originalname}`;
          variationThumbnailPath = path.join(
            destinationFolderVarDB,
            variationThumbnailFilename
          );
        }

        try {
          const [variaion, created] = await ProductVariation.findOrCreate({
            where: {
              var_name: variationName,
              productID: productID,
            },
            defaults: {
              productID: productID,
              var_name: variationName,
              price: price,
              var_image: variationThumbnailPath ? variationThumbnailPath : null,
              amt_on_hand: amountOnHand,
              status:
                amountOnHand > 10
                  ? "In Stock"
                  : amountOnHand < 10 && amountOnHand > 0
                  ? "Low Stock"
                  : "Out of Stock",
            },
          });

          if (created) {
            res
              .status(200)
              .json({ message: "New Variation Created Successfully" });
          } else {
            res.status(409).json({ error: "Varitaion Already Exists" });
          }
        } catch (error) {
          console.error("Create Variation Error:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    );
  },

  updateVariation: async (req, res) => {
    const { prodVariationID } = req.query;

    // Get the current variation image path.
    let currentVariationImage = null;
    try {
      currentVariationImage = await ProductVariation.findOne({
        where: { prodVariationID: prodVariationID },
        attributes: ["var_image"],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Cannot Retrieve Variation Thumbnail" });
    }

    // Check if the current variation image path is not null.
    let existingThumbnailPath = null;
    if (currentVariationImage) {
      existingThumbnailPath = `uploads/${currentVariationImage.var_image}`;
    }

    // Upload the new image and delete the old image if it exists.
    const timestamp = Date.now();
    const upload = configureMulter(destinationFolderVar, timestamp);

    upload.fields([{ name: "variationThumbnail" }])(
      req,
      res,
      async function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "File upload error" });
        }

        const { amountOnHand, price, variationName } = req.body;

        let variationThumbnailPath = null;
        if (req.files.variationThumbnail) {
          // Delete the old image if it exists.
          if (existingThumbnailPath) {
            try {
              fs.unlinkSync(existingThumbnailPath);
            } catch (error) {
              console.error("Error updating thumbnail", error);
              // You can also add a message to the response here.
            }
          }

          // Upload the new image.
          const variationThumbnailFile = req.files.variationThumbnail[0];
          const variationThumbnailFilename = `${timestamp}_${variationThumbnailFile.originalname}`;
          variationThumbnailPath = path.join(
            destinationFolderVarDB,
            variationThumbnailFilename
          );
        }

        // Update the variation in the database.
        try {
          await ProductVariation.update(
            {
              var_name: variationName,
              price: price,
              amt_on_hand: amountOnHand,
              status:
                amountOnHand > 10
                  ? "In Stock"
                  : amountOnHand < 10 && amountOnHand > 0
                  ? "Low Stock"
                  : "Out of Stock",
            },
            { where: { prodVariationID: prodVariationID } }
          );

          if (variationThumbnailPath && currentVariationImage) {
            await ProductVariation.update(
              { var_image: variationThumbnailPath },
              { where: { prodVariationID: prodVariationID } }
            );
          }

          res
            .status(200)
            .json({ message: "Product Variation updated successfully" });
        } catch (error) {
          console.error("Error updating Product:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }
    );
  },

  deleteVariation: async (req, res) => {
    const { prodVariationID } = req.query;

    try {
      await ProductVariation.destroy({
        where: { prodVariationID: prodVariationID },
      });
      return res.sendStatus(200);
    } catch (error) {
      console.error("Delete Product Variation Error: ", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Delete Variation Failed" });
    }
  },

  restoreVariation: async (req, res) => {
    const { prodVariationID } = req.query;

    try {
      await ProductVariation.restore({
        where: {
          prodVariationID: prodVariationID,
        },
      });

      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Variation Error: ", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Restore Variation" });
    }
  },
};
