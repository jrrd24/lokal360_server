const { Op } = require("sequelize");
const ShopEmployee = require("../models/ShopEmployee");
const User = require("../models/User");
const Shopper = require("../models/Shopper");
const sequelize = require("../config/sequelize");

module.exports = {
  getAllShopEmployee: async (req, res) => {
    const { shopID } = req.query;
    try {
      const allShopEmployeeData = await ShopEmployee.findAll({
        where: { shopID: shopID },
        attributes: [
          "shopEmployeeID",
          "userID",
          "shopID",
          "job_title",
          "access_analytics",
          "access_products",
          "access_customers",
          "access_orders",
          "access_shop_information",
          "access_promos",
          "access_lokal_ads",
          "access_vouchers",
        ],
        include: [
          {
            model: User,
            attributes: [
              "email",
              [sequelize.literal("token IS NOT NULL"), "is_active"],
              "first_name",
              "last_name",
              "profile_pic",
            ],
            include: [{ model: Shopper, attributes: ["username"] }],
          },
        ],
      });

      const allShopEmployee = allShopEmployeeData.map((employee) => {
        const {
          shopEmployeeID,
          userID,
          shopID,
          job_title,
          access_analytics,
          access_products,
          access_customers,
          access_orders,
          access_shop_information,
          access_promos,
          access_lokal_ads,
          access_vouchers,
        } = employee;

        const {
          email,
          is_active,
          first_name,
          last_name,
          profile_pic,
          Shopper,
        } = employee.User;
        const { username } = Shopper;

        return {
          shopEmployeeID,
          userID,
          shopID,
          job_title,
          access_analytics,
          access_products,
          access_customers,
          access_orders,
          access_shop_information,
          access_promos,
          access_lokal_ads,
          access_vouchers,
          email,
          is_active,
          first_name,
          last_name,
          profile_pic,
          username,
        };
      });

      res.status(200).json(allShopEmployee);
    } catch (error) {
      console.error("Get All Shop Employees Error", error);
      res.sendStatus(500);
    }
  },

  addShopEmployee: async (req, res) => {
    const { shopID } = req.query;

    try {
      const user = await User.findOne({
        where: { email: req.body.employeeEmail },
        attributes: ["userID", "email"],
      });

      if (user) {
        const existingEmployeeRecord = await ShopEmployee.findOne({
          where: { userID: user.userID, shopID: { [Op.not]: null } },
        });

        if (existingEmployeeRecord) {
          res.status(409).json({
            error:
              "Employee Already Exists or is Currently Registered in Another Shop",
          });
        } else {
          const [employee, created] = await ShopEmployee.findOrCreate({
            where: { userID: user.userID, shopID: shopID },
            defaults: {
              userID: user.userID,
              shopID: shopID,
              job_title: req.body.jobTitle,
              access_analytics: req.body.access_analytics,
              access_products: req.body.access_products,
              access_customers: req.body.access_customers,
              access_orders: req.body.access_orders,
              access_shop_information: req.body.access_shop_information,
              access_promos: req.body.access_promos,
              access_lokal_ads: req.body.access_lokal_ads,
              access_vouchers: req.body.access_vouchers,
            },
          });

          await User.update(
            { is_shop_employee: true },
            { where: { userID: user.userID } }
          );

          if (created) {
            res
              .status(200)
              .json({ message: "Employee Registered Successfully", employee });
          }
        }
      } else {
        res.status(404).json({ error: "No Registered User Found" });
      }
    } catch (error) {
      console.error("Add Shop Employee Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  editShopEmployee: async (req, res) => {
    const { shopEmployeeID } = req.query;

    try {
      await ShopEmployee.update(
        {
          job_title: req.body.jobTitle,
          access_analytics: req.body.access_analytics,
          access_products: req.body.access_products,
          access_customers: req.body.access_customers,
          access_orders: req.body.access_orders,
          access_shop_information: req.body.access_shop_information,
          access_promos: req.body.access_promos,
          access_lokal_ads: req.body.access_lokal_ads,
          access_vouchers: req.body.access_vouchers,
        },
        { where: { shopEmployeeID: shopEmployeeID } }
      );

      res.sendStatus(200);
    } catch (error) {
      console.error("Update Shop Employee Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  deleteShopEmployee: async (req, res) => {
    const { shopEmployeeID } = req.query;
    try {
      await ShopEmployee.destroy({
        where: {
          shopEmployeeID: shopEmployeeID,
        },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Delete Shop Employee Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  restoreShopEmployee: async (req, res) => {
    const { shopEmployeeID } = req.query;
    try {
      await ShopEmployee.restore({
        where: {
          shopEmployeeID: shopEmployeeID,
        },
      });
      res.sendStatus(200);
    } catch (error) {
      console.error("Restore Shop Employee Error: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
