const { sign, verify } = require("jsonwebtoken");
require(`dotenv`).config();

const createTokens = (user) => {
  //payload | secret | expiration date
  const accessToken = sign(
    {
      userID: user.userID,
      is_shopper: user.is_shopper,
      is_shop_owner: user.is_shop_owner,
      is_shop_employee: user.is_shop_employee,
      is_admin: user.is_admin,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: `5m` }
  );

  const refreshToken = sign(
    {
      userID: user.userID,
      is_shopper: user.is_shopper,
      is_shop_owner: user.is_shop_owner,
      is_shop_employee: user.is_shop_employee,
      is_admin: user.is_admin,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `30d` }
  );

  return { accessToken, refreshToken };
};

module.exports = { createTokens };
