const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ProductVariation = require("../models/ProductVariation");
const Shopper = require("../models/Shopper");
const Shop = require("../models/Shop");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const { Op, Sequelize } = require("sequelize");
const User = require("../models/User");
const DeliveryAddress = require("../models/DeliveryAddress");
const ShopperClaimedVoucher = require("../models/ShopperClaimedVoucher");
const Voucher = require("../models/Voucher");
const Promo = require("../models/Promo");
const PromoType = require("../models/PromoType");
const sequelize = require("../config/sequelize");

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
      shippingFee,
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
          shipping_fee: shippingFee,
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
                attributes: ["var_name", "price"],
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
        order: [
          Sequelize.literal(
            `FIELD(order.status, 'Pending Approval', 'Preparing', 'Ready For Pick-Up', 'On Delivery', 'Complete', 'Cancelled', 'For Refund')`
          ),
          ["createdAt", "DESC"],
        ],
      });

      const flattenedOrders = shopOrders.map((order) => {
        const dateCreatedUTC = new Date(order.createdAt);

        // Assuming the server stores time in UTC, convert it to the user's local time
        const dateCreatedLocal = new Date(
          dateCreatedUTC.toLocaleString("en-PH", { timeZone: "UTC" })
        );

        const formattedDate = dateCreatedLocal.toLocaleString("en-PH", {
          month: "2-digit",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });

        // Calculate total_price for each order
        const orderTotalPrice = order.OrderItems.reduce(
          (total, orderItem) =>
            total + orderItem.quantity * orderItem.ProductVariation.price,
          0
        );

        return {
          orderID: order.orderID,
          shopperID: order.shopperID,
          status: order.status,
          shipping_method: order.shipping_method,
          createdAt: formattedDate,
          // shipping_fee: order.shipping_fee,
          OrderItems: order.OrderItems.map((orderItem) => ({
            total_price: orderItem.quantity * orderItem.ProductVariation.price,
            quantity: orderItem.quantity,
            prodVariationID: orderItem.prodVariationID,
            var_name: orderItem.ProductVariation.var_name,
            product_name: orderItem.ProductVariation.Product.product_name,
            shopID: orderItem.ProductVariation.Product.shopID,
          })),
          Shopper: {
            username: order.Shopper.username,
            first_name: order.Shopper.User.first_name,
            last_name: order.Shopper.User.last_name,
          },
        };
      });

      res.status(200).json(flattenedOrders);
    } catch (error) {
      console.error("Get All Shop Orders Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Retreive Shop Orders`,
      });
    }
  },

  getShopOrderDetails: async (req, res) => {
    const { orderID } = req.query;

    try {
      const orderDetails = await Order.findOne({
        where: { orderID: orderID },
        attributes: [
          "orderID",
          "shopperID",
          "status",
          "shipping_method",
          "createdAt",
          "approved_at",
          "completed_at",
          "shipping_fee",
        ],

        include: [
          {
            model: OrderItem,
            attributes: ["quantity", "prodVariationID", "orderItemID"],
            include: [
              {
                model: ProductVariation,
                attributes: ["var_name", "var_image", "price"],
                include: [
                  {
                    model: Product,
                    attributes: ["product_name", "shopID"],
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
            include: [
              {
                model: User,
                attributes: ["first_name", "last_name", "mobile_num"],
              },
              {
                model: DeliveryAddress,
                attributes: [
                  "municipality",
                  "barangay",
                  "postal_code",
                  "region",
                  "province",
                  "address_line_1",
                  "address_line_2",
                ],
                where: { is_active: true },
              },
            ],
          },
          {
            model: ShopperClaimedVoucher,
            attributes: ["voucherID"],
            include: [
              {
                model: Voucher,
                attributes: ["start_date", "end_date"],
                include: [
                  {
                    model: Promo,
                    attributes: ["min_spend", "discount_amount"],
                    include: [
                      {
                        model: PromoType,
                        attributes: ["promo_type_name"],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      // Flatten the response
      const flattenedOrders = {
        orderID: orderDetails.orderID,
        shopperID: orderDetails.shopperID,
        status: orderDetails.status,
        shipping_method: orderDetails.shipping_method,
        createdAt: orderDetails.createdAt,
        approved_at: orderDetails.approved_at,
        completed_at: orderDetails.completed_at,
        shipping_fee: orderDetails.shipping_fee,
        OrderItems: orderDetails.OrderItems.map((item) => ({
          orderItemID: item.orderItemID,
          quantity: item.quantity,
          prodVariationID: item.prodVariationID,
          var_name: item.ProductVariation.var_name,
          product_name: item.ProductVariation.Product.product_name,
          var_image: item.ProductVariation.var_image,
          price: item.ProductVariation.price,
          product_name: item.ProductVariation.Product.product_name,
          shopID: item.ProductVariation.Product.shopID,
        })),
        Shopper: {
          username: orderDetails.Shopper.username,
          first_name: orderDetails.Shopper.User.first_name,
          last_name: orderDetails.Shopper.User.last_name,
          mobile_num: orderDetails.Shopper.User.mobile_num,
          DeliveryAddress: orderDetails.Shopper.DeliveryAddresses.map(
            (address) => ({
              municipality: address.municipality,
              barangay: address.barangay,
              postal_code: address.postal_code,
              region: address.region,
              province: address.province,
              address_line_1: address.address_line_1,
              address_line_2: address.address_line_2,
            })
          ),
        },
        AppliedVoucher: {
          voucherID: orderDetails.ShopperClaimedVoucher.voucherID,
          startDate: orderDetails.ShopperClaimedVoucher.Voucher.start_date,
          endDate: orderDetails.ShopperClaimedVoucher.Voucher.end_date,
          min_spend: orderDetails.ShopperClaimedVoucher.Voucher.Promo.min_spend,
          discount_amount:
            orderDetails.ShopperClaimedVoucher.Voucher.Promo.discount_amount,
          promo_type_name:
            orderDetails.ShopperClaimedVoucher.Voucher.Promo.PromoType
              .promo_type_name,
        },

        // Calculate total_price for each order
        sum_order_price: orderDetails.OrderItems.reduce(
          (total, orderItem) =>
            total + orderItem.quantity * orderItem.ProductVariation.price,
          0
        ),
      };

      res.status(200).json(flattenedOrders);
    } catch (error) {
      console.error("Get Order Info Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Retreive Order Info`,
      });
    }
  },

  updateOrderStatus: async (req, res) => {
    const { orderID, updatedStatus } = req.query;

    try {
      await Order.update(
        { status: updatedStatus },
        { where: { orderID: orderID } }
      );
      res.status(200).json({ message: "Updated Order Status" });
    } catch (error) {
      console.error("Update Order Status Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Update Order Status`,
      });
    }
  },

  getShopOrderCount: async (req, res) => {
    const { shopID } = req.query;

    try {
      const allOrders = await Order.findAll({
        attributes: ["status"],
        include: [
          {
            model: OrderItem,
            attributes: [],
            include: [
              {
                model: ProductVariation,
                attributes: [],
                include: [
                  {
                    model: Product,
                    attributes: [],
                    where: {
                      shopID: shopID,
                    },
                  },
                ],
                required: true,
              },
            ],
            required: true,
          },
        ],
      });

      //GET STATUS COUNT
      let pendingApprovalCount = 0;
      let preparingCount = 0;
      let pickUpCount = 0;
      let deliveryCount = 0;
      let completeCount = 0;
      let cancelledCount = 0;
      let refundCount = 0;

      await Promise.all(
        allOrders.map(async (order) => {
          if (order.status === "Pending Approval") pendingApprovalCount++;
          else if (order.status === "Preparing") preparingCount++;
          else if (order.status === "Ready For Pick-Up") pickUpCount++;
          else if (order.status === "On Delivery") deliveryCount++;
          else if (order.status === "Complete") completeCount++;
          else if (order.status === "Cancelled") cancelledCount++;
          else if (order.status === "For Refund") refundCount++;
        })
      );

      const statusCounts = {
        pendingApproval: pendingApprovalCount,
        preparing: preparingCount,
        pickUp: pickUpCount,
        onDelivery: deliveryCount,
        complete: completeCount,
        cancelled: cancelledCount,
        refund: refundCount,
      };

      res.status(200).json(statusCounts);
    } catch (error) {
      console.error("Get Order Status Count Error", error);
      res.status(500).json({
        error: `Internal Server Error: Cannot Get Order Status Count`,
      });
    }
  },
};
