const User = require("../models/User");
const Shopper = require("../models/Shopper");
const DeliverAddress = require("../models/DeliveryAddress");
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

  // DELIVERY ADDRESS
  createDeliveryAddress: async (req, res) => {
    const { shopperID } = req.query;

    const {
      barangay,
      addressLine1,
      addressLine2,
      municipality,
      postalCode,
      province,
      region,
      latitude,
      longitude,
    } = req.body;

    try {
      const [deliveryAddress, created] = await DeliverAddress.findOrCreate({
        where: { shopperID: shopperID, address_line_1: addressLine1 },
        defaults: {
          shopperID: shopperID,
          municipality: municipality,
          barangay: barangay,
          postal_code: postalCode,
          region: region,
          province: province,
          address_line_1: addressLine1,
          address_line_2: addressLine2,
          latitude: latitude,
          longitude: longitude,
        },
      });

      if (created) {
        res.status(200).json({
          message: "Delivery Address Created Successfully",
          deliveryAddress,
        });
      } else {
        res.status(409).json({
          error: "Delivery Address Already Exists",
        });
      }
    } catch (error) {
      console.error("Create Delivery Address", error);
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
  },

  deleteDeliveryAddress: async (req, res) => {
    const { deliveryAddressID } = req.query;

    try {
      await DeliverAddress.destroy({
        where: { deliveryAddressID: deliveryAddressID },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Delete Delivery Address", error);
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
  },

  restoreDeliveryAddress: async (req, res) => {
    const { deliveryAddressID } = req.query;

    try {
      await DeliverAddress.restore({
        where: { deliveryAddressID: deliveryAddressID },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Delivery Address", error);
      res.status(500).json({ error: `Internal server error: ${error}` });
    }
  },

  setActiveDeliveryAddress: async (req, res) => {
    const { deliveryAddressID, shopperID } = req.query;

    try {
      const activeDA = await DeliverAddress.findOne({
        where: { is_active: true, shopperID: shopperID },
      });

      if (activeDA.deliveryAddressID !== deliveryAddressID) {
        await DeliverAddress.update(
          { is_active: false },
          { where: { deliveryAddressID: activeDA.deliveryAddressID } }
        );

        await DeliverAddress.update(
          { is_active: true },
          { where: { deliveryAddressID: deliveryAddressID } }
        );
      }
      res.sendStatus(200);
    } catch (error) {
      console.log("Set Active Delivery Address Error: ", error);
      res.status(500).json({ error: `Internal Server Error: ${error}` });
    }
  },

  getAllDeliveryAddress: async (req, res) => {
    const { shopperID } = req.query;

    try {
      const activeDeliveryAddress = await DeliverAddress.findOne({
        where: { shopperID: shopperID, is_active: true },
      });

      const inactiveDeliveryAddress = await DeliverAddress.findAll({
        where: { shopperID: shopperID, is_active: false },
      });

      res.status(200).json({ activeDeliveryAddress, inactiveDeliveryAddress });
    } catch (error) {
      console.log("Get All Delivery Address: ", error);
      res.status(500).json({ error: `Internal Server Error: ${error}` });
    }
  },
};
