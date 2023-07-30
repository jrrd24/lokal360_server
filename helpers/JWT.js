const { sign, verify } = require("jsonwebtoken");

const createTokens = (user) => {
  //payload | secret | expiration date
  const accessToken = sign(
    { userID: user.userID, email: user.email, user_role: user.user_role },
    "lokal360JJADS"
  );

  return accessToken;
};

module.exports = { createTokens };
