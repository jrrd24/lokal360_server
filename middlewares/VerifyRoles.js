const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.roles) return res.sendStatus(401);

    // Check if any of the allowed roles are present in user's roles
    const allowed = allowedRoles.some((role) => req.roles.includes(role));

    if (allowed) {
      next();
    } else {
      res.sendStatus(401);
    }
  };
};

module.exports = verifyRoles;
