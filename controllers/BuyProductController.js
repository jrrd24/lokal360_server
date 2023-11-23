const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductVariation = require("../models/ProductVariation");
const Shopper = require("../models/Shopper");
const Shop = require("../models/Shop");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const { Op } = require("sequelize");
const User = require("../models/User");

module.exports = {
  //CART
  addToCart: async (req, res) => {
    const { shopperID } = req.query;
    const { quantity, prodVariationID } = req.body;

    try {
      //CREATE CART
      const [cart] = await Cart.findOrCreate({
        where: { shopperID: shopperID },
      });

      if (cart) {
        //CREATE CART ITEM (PRODUCT IN CART)
        const [cartItem, created] = await CartItem.findOrCreate({
          where: {
            cartID: cart.cartID,
            prodVariationID: prodVariationID,
            quantity: quantity,
            deletedAt: null,
          },
        });

        if (created) {
          res.status(200).json(cartItem);
        } else {
          res.status(409).json({ error: "Cart Item Already Exists" });
        }
      } else {
        res
          .status(404)
          .json({ error: `Internal Server Error: Shopper Cart Not Found` });
      }
    } catch (error) {
      console.error("Add To Cart Error", error);
      res
        .status(500)
        .json({ error: "Internal Server Error: Cannot Add Product to Cart" });
    }
  },

  editCartItemQuantity: async (req, res) => {
    const { cartItemID, quantity } = req.query;
    try {
      await CartItem.update(
        { quantity: quantity },
        { where: { cartItemID: cartItemID } }
      );
      res.sendStatus(200);
    } catch (error) {
      console.error("Edit Cart Item Quantity Error", error);
      res.status(500).json({
        error: `Internal Server Error: Edit Quantity Failed`,
      });
    }
  },

  deleteCartItem: async (req, res) => {
    const { cartItemID } = req.query;
    try {
      await CartItem.destroy({ where: { cartItemID: cartItemID } });
      res.sendStatus(200);
    } catch (error) {
      console.error("Delete Cart Item Error", error);
      res.status(500).json({
        error: `Internal Server Error: Delete Cart Item Failed`,
      });
    }
  },

  restoreCartItem: async (req, res) => {
    const { cartItemID } = req.query;
    try {
      await CartItem.restore({ where: { cartItemID: cartItemID } });
      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Cart Item Error", error);
      res.status(500).json({
        error: `Internal Server Error: Restore Cart Item Failed`,
      });
    }
  },

  getShopperCart: async (req, res) => {
    const { shopperID } = req.query;

    try {
      const cartData = await Cart.findOne({
        where: { shopperID: shopperID },
        attributes: ["cartID", "shopperID"],
        include: [
          {
            model: CartItem,
            attributes: ["prodVariationID", "quantity"],
            include: [
              {
                model: ProductVariation,
                attributes: ["var_name", "price", "var_image"],
                include: [
                  {
                    model: Product,
                    attributes: ["product_name"],
                    include: [
                      {
                        model: Shop,
                        attributes: ["shop_name", "is_360_partner"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });

      // Group cart items by shop
      const groupedCartByShop = {};
      cartData.CartItems.forEach((cartItem) => {
        const shopID = cartItem.ProductVariation.Product.Shop.shopID;

        if (!groupedCartByShop[shopID]) {
          groupedCartByShop[shopID] = {
            shopID: shopID,
            shop_name: cartItem.ProductVariation.Product.Shop.shop_name,
            is_360_partner:
              cartItem.ProductVariation.Product.Shop.is_360_partner,
            cartItems: [],
          };
        }

        groupedCartByShop[shopID].cartItems.push({
          prodVariationID: cartItem.prodVariationID,
          quantity: cartItem.quantity,
          var_name: cartItem.ProductVariation.var_name,
          price: cartItem.ProductVariation.price,
          var_image: cartItem.ProductVariation.var_image,
          product_name: cartItem.ProductVariation.Product.product_name,
        });
      });

      const groupedCartArray = Object.values(groupedCartByShop);

      const processedCartData = {
        cartID: cartData.cartID,
        shopperID: cartData.shopperID,
        CartItemsByShop: groupedCartArray,
      };

      res.status(200).json(processedCartData);
    } catch (error) {
      console.error("Get Shopper Cart Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Retrieve Cart Data`,
      });
    }
  },

  //CHECK OUT PROCESS
  // get shopper cart info, get active delivery address,
  // get delivery options, get payment method options,
  // get applied vouchers options, get order summary,
  // get subtotal and saved prices

  //CREATE ORDER
  createOrder: async (req, res) => {
    const { shopperID } = req.query;
    const {
      deliveryAddressID,
      shopperClaimedVoucherID,
      shippingMethod,
      totalPrice,
      orderItems,
    } = req.body;

    try {
      // CREATE ORDER DETAILS
      const [order, created] = await Order.findOrCreate({
        where: {
          shopperID: shopperID,
          deliveryAddressID: deliveryAddressID,
          shopperClaimedVoucherID: shopperClaimedVoucherID,
          status: "Pending Approval",
          shipping_method: shippingMethod,
          approved_at: null,
          completed_at: null,
          total_price: totalPrice,
          deletedAt: null,
        },
      });

      if (created) {
        const cartItems = await CartItem.findAll({
          where: { cartItemID: { [Op.in]: orderItems } },
        });

        // Iterate through each cart item and create an OrderItem for each
        const orderItemsCreated = [];
        for (const cartItem of cartItems) {
          const [orderItem] = await OrderItem.findOrCreate({
            where: {
              orderID: order.orderID,
              prodVariationID: cartItem.prodVariationID,
              quantity: cartItem.quantity,
            },
          });

          orderItemsCreated.push(orderItem);
        }

        res.status(200).json({ order, orderItemsCreated });
      } else {
        res.status(409).json({ error: "Order already exists" });
      }
    } catch (error) {
      console.error("Create Order Error", error);
      res.status(500).json({
        error: `Internal Server Error: Failed to Create Order`,
      });
    }
  },

  getAllShopOrders: async (req, res) => {
    const { shopID } = req.query;

    try {
      const shopOrders = await Order.findAll({
        attributes: [
          "orderID",
          "shopperID",
          "status",
          "shipping_method",
          "createdAt",
        ],
        include: [
          {
            model: OrderItem,
            attributes: ["quantity", "prodVariationID"],
            include: [
              {
                model: ProductVariation,
                attributes: ["prodVariationID"],
                include: [
                  {
                    model: Product,
                    attributes: ["product_name", "shopID"],
                    where: { shopID: shopID },
                    required: true,
                  },
                ],
                required: true,
              },
            ],
            required: true,
          },
          {
            model: Shopper,
            attributes: ["username"],
            include: [{ model: User, attributes: ["first_name", "last_name"] }],
          },
        ],
      });

      const flattenedOrders = shopOrders.map((order) => ({
        orderID: order.orderID,
        shopperID: order.shopperID,
        status: order.status,
        shipping_method: order.shipping_method,
        createdAt: order.createdAt,
        OrderItems: order.OrderItems.map((orderItem) => ({
          quantity: orderItem.quantity,
          prodVariationID: orderItem.prodVariationID,
          product_name: orderItem.ProductVariation.Product.product_name,
          shopID: orderItem.ProductVariation.Product.shopID,
        })),
        Shopper: {
          username: order.Shopper.username,
          first_name: order.Shopper.User.first_name,
          last_name: order.Shopper.User.last_name,
        },
      }));

      res.status(200).json(flattenedOrders);
    } catch (error) {
      console.error("Get All Shop Orders Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Retreive Shop Orders`,
      });
    }
  },
};
