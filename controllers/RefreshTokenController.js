const User = require("../models/User");
const { createTokens } = require("../helpers/JWT");
const { verify } = require("jsonwebtoken");

module.exports = {
  // login user
  handleRefreshToken: async (req, res) => {
    const cookies = req.cookies;

    if (!cookies?.["refresh-token"]) {
      return res.sendStatus(401);
    }
    const refreshToken = cookies["refresh-token"];

    //find user
    const foundUser = await User.findOne({ where: { token: refreshToken } });
    if (!foundUser) return res.status(403); //Forbidden

    //evaluate jwt
    verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || !decoded || foundUser.userID !== decoded.userID) {
        return res.sendStatus(403);
      }
      const tokens = createTokens(foundUser);
      const accessToken = tokens.accessToken;
      res.json({ accessToken });
    });
  },
};
