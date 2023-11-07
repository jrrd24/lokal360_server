const User = require("../models/User");
const { createTokens } = require("../helpers/JWT");
const { verify } = require("jsonwebtoken");

module.exports = {
  // logout user
  logout: async (req, res) => {
    console.log("Cookies:", req.cookies);
    console.log("Authorization Header:", req.headers["authorization"]);

    const cookies = req.cookies;
    if (!cookies?.["jwt"]) {
      return res.sendStatus(204);
    }
    const refreshToken = cookies["jwt"];

    // check ref token in db
    const foundUser = await User.findOne({ where: { token: refreshToken } });
    if (!foundUser) {
      res.clearCookie("refresh-token", {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      return res.sendStatus(204);
    }

    // delete token from db
    await User.update({ token: null }, { where: { userID: foundUser.userID } });
    //clear cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.sendStatus(204);
  },
};
