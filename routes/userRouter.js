const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticationToken");

const userRouter = express.Router();

userRouter.get("/", userController.userAccount);
//userRouter.post("/send-message", authenticate, userController.storeMessage);
userRouter.get("/get-messages", authenticate, userController.getMessages);
userRouter.get("/user-details", authenticate, userController.getUserDetails);

module.exports = userRouter;
