const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Token is missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      if (!decoded) {
        return next(new Error("Token expired"));
      }

      const user = await User.findByPk(decoded.id);

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Internal server error"));
    }
  });
};
