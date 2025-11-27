const express = require("express");
const authController = require("../controllers/authController");

const authRouter = express.Router();

authRouter.get("/", authController.homePage);
authRouter.get("/login", authController.loginPage);
authRouter.get("/sign-up", authController.signupPage);
authRouter.post("/sign-up", authController.addUser);
authRouter.post("/login", authController.loginUser);

module.exports = authRouter;
