const User = require("../models/User");
const Shopper = require("../models/Shopper");
const ShopOwner = require("../models/ShopOwner");
const Admin = require("../models/Admin");
const ShopEmployee = require("../models/ShopEmployee");
const path = require("path");
const destinationFolder = "uploads/user/profilePic";
const destinationFolderDB = "user/profilePic";
const configureMulter = require("../helpers/MulterConfig");
const upload = configureMulter(destinationFolder);
const fs = require("fs");

module.exports = {
  //get profile
  getProfile: async (req, res) => {
    const { userID } = req.query;
    try {
      const result = await User.findOne({
        where: {
          userID: userID,
        },
        attributes: [
          "email",
          "first_name",
          "last_name",
          "mobile_num",
          "birthday",
          "gender",
          "profile_pic",
          "is_shop_owner",
          "is_shop_employee",
          "is_admin",
          "createdAt",
          "updatedAt",
        ],

        include: [
          {
            model: Shopper,
            required: true,
            attributes: ["username"],
          },

          { model: ShopEmployee },
          { model: ShopOwner },
          { model: Admin },
        ],
      });

      res.status(200).json(result); //Return Result
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //update profle
  updateProfile: async (req, res) => {
    const { userID } = req.query;

    let currentProfilePic = null;
    try {
      currentProfilePic = await User.findOne({
        where: { userID: userID },
        attributes: ["profile_pic"],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Cannot Retreive Profile Picture " });
    }

    let existingProfilePicPath = null;
    if (currentProfilePic && currentProfilePic.profile_pic !== null) {
      existingProfilePicPath = `uploads/${currentProfilePic.profile_pic}`;
    }

    //upload image
    const timestamp = Date.now();
    const upload = configureMulter(destinationFolder, timestamp);

    upload.fields([{ name: "profilePic" }])(req, res, async function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "File upload error" });
      }

      const { birthday, firstName, gender, lastName, phoneNumber, username } =
        req.body;

      // image path for db
      let profilePicPath = null;
      if (req.files.profilePic) {
        //delete existing image from storage
        if (existingProfilePicPath) {
          try {
            fs.unlinkSync(existingProfilePicPath);
          } catch (error) {
            console.error("Error updating Profile Pic", error);
            return res
              .status(500)
              .json({ error: "Error Updating Profile Pic" });
          }
        }

        const profilePicFile = req.files.profilePic[0];
        const profilePicFilename = `${timestamp}_${profilePicFile.originalname}`;
        profilePicPath = path.join(destinationFolderDB, profilePicFilename);
      }

      // update user table
      try {
        await User.update(
          {
            first_name: firstName,
            last_name: lastName,
            gender: gender,
            mobile_num: phoneNumber,
            birthday: birthday,
          },
          { where: { userID: userID } }
        );

        if (birthday) {
          await User.update(
            { birthday: birthday },
            { where: { userID: userID } }
          );
        }

        await Shopper.update(
          { username: username },
          { where: { userID: userID } }
        );

        console.log("PFPP", profilePicPath);

        if (profilePicPath) {
          await User.update(
            { profile_pic: profilePicPath },
            { where: { userID: userID } }
          );
        }

        res.status(200).json({ message: "User Profile updated Successfully" });
      } catch (error) {
        console.error("Error updating User Profile:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  },
};
