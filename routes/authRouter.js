const express = require("express");
const authController = require("../controllers/authController");

const authRouter = express.Router();

authRouter.get("/sign-up", authController.signupPage);
authRouter.post("/sign-up", authController.signupUser);
authRouter.get("/login", authController.loginPage);
authRouter.post("/login", authController.loginUser);

module.exports = authRouter;
