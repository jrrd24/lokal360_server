const User = require("../models/User");
const { createTokens } = require("../helpers/JWT");
const { verify } = require("jsonwebtoken");
const { access } = require("fs");

module.exports = {
  // login user
  handleRefreshToken: async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.["jwt"]) {
      return res.sendStatus(401);
    }
    const refreshToken = cookies["jwt"];

    //find user
    const foundUser = await User.findOne({ where: { token: refreshToken } });
    if (!foundUser) return res.status(403); //Forbidden

    //evaluate jwt
    verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || !decoded || foundUser.userID !== decoded.userID) {
        return res.sendStatus(403);
      }
      const tokens = createTokens(foundUser);
      const roles = decoded.roles;
      const accessToken = tokens.accessToken;
      const userID = foundUser.userID;
      res.json({ accessToken, roles, userID });
    });
  },
};
