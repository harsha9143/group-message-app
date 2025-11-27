const jwt = require("jsonwebtoken");
exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied...Token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, async (error, user) => {
      if (error) {
        return res
          .status(403)
          .json({ message: "Invalid token/session expired" });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    return;
  }
};
