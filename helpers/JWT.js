const { sign, verify } = require("jsonwebtoken");
require(`dotenv`).config();

const createTokens = (user) => {
  //create roles array
  const roles = [];
  if (user.is_shopper) {
    roles.push("shopper");
  }
  if (user.is_shop_owner) {
    roles.push("shop owner");
  }
  if (user.is_shop_employee) {
    roles.push("shop employee");
  }
  if (user.is_admin) {
    roles.push("admin");
  }

  //payload | secret | expiration date
  const accessToken = sign(
    { userID: user.userID, roles: roles },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: `5m` }
  );

  const refreshToken = sign(
    { userID: user.userID, roles: roles },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `30d` }
  );

  return { accessToken, refreshToken };
};

module.exports = { createTokens };
