const jwt = require("jsonwebtoken");
const User = require("../models/user");

const socketAuth = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Token is missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      if (!decoded) {
        return next(new Error("Invalid token!! please login"));
      }

      const user = await User.findByPk(decoded.id);

      socket.user = user;
      next();
    } catch (error) {
      return next(new Error("Internal server error"));
    }
  });
};

module.exports = socketAuth;
