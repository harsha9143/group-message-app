const express = require("express");
const userController = require("../controllers/userController");

const userRouter = express.Router();

userRouter.get("/", userController.userAccount);
userRouter.post("/send-message", userController.storeMessage);

module.exports = userRouter;
