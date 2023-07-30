const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.cookies["access-token"];
  // Log the token value
  console.log("Access Token:", accessToken);

  if (!accessToken)
    return res.status(400).json({ error: "User not Authenticated" });

  try {
    const validToken = verify(accessToken, "lokal360JJADS");
    // Log the decoded token object
    console.log("Valid Token:", validToken);
    if (validToken) {
      req.authenticated = true;
      req.validToken = validToken;
      console.log(req.authenticated);
      return next();
    }
  } catch (err) {
    return res.status(400).json({ error: err });
  }
};

module.exports = { validateToken };