const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const ProductVariation = require("../models/ProductVariation");
const VoucherAppliedProduct = require("../models/VoucherAppliedProduct");
const path = require("path");
const destinationFolder = "uploads/shop/product";
const destinationFolderDB = "shop/product";
const configureMulter = require("../helpers/MulterConfig");
const upload = configureMulter(destinationFolder);
const fs = require("fs");
const sequelize = require("../config/sequelize");
const ShopCategory = require("../models/ShopCategory");
const Category = require("../models/Category");
const { Op } = require("sequelize");

module.exports = {
  // get data of all products of shop
  getAllShopProduct: async (req, res) => {
    const { shopID } = req.query;
    try {
      const allProducts = await Product.findAll({
        where: { shopID: shopID },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });

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
          { model: ProductVariation },
          { model: VoucherAppliedProduct },
        ],
      });

      if (product) {
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
          console.error(error);
          return res.status(500).json({ error: "File upload error" });
        }

        console.log(req.body);

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
      console.error("Delete Product Image Error: ", error);
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
      const allFeatured = await Product.findAll({
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
      const topProducts = await Product.findAll({
        limit: 5,
        order: [["total_sold", "DESC"]],
        where: { shopID: shopID },
        include: [
          {
            model: ProductImage,
            attributes: ["prod_image"],
          },
        ],
      });
      res.status(200).json({ topProducts });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Retrieve Top Products" });
    }
  },
};
