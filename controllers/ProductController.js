const Product = require("../models/Product");
const ProductImage = require("../models/ProductImage");
const path = require("path");
const destinationFolder = "uploads/shop/product";
const destinationFolderDB = "shop/product";
const configureMulter = require("../helpers/MulterConfig");
const upload = configureMulter(destinationFolder);
const fs = require("fs");
const sequelize = require("../config/sequelize");

module.exports = {
  getAllProduct: async (req, res) => {
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

      res.json(allProducts);
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
    console.log("REQ", req.body);
    console.log("REQ FILE", req.files);

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
};
