const { verify } = require("jsonwebtoken");
require(`dotenv`).config();

const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith(`Bearer `)) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  //bearer token
  console.log(authHeader);
  const token = authHeader.split(` `)[1];
  verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT Verification Error:", err);
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = decoded.userID;
    req.roles = decoded.roles;
    next();
  });
};

module.exports = { validateToken };
