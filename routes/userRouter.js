const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticationToken");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const userRouter = express.Router();

userRouter.get("/", userController.userAccount);
//userRouter.post("/send-message", authenticate, userController.storeMessage);
userRouter.get("/get-messages", authenticate, userController.getMessages);
userRouter.get("/user-details", authenticate, userController.getUserDetails);
userRouter.post("/user-exists", authenticate, userController.userExists);
userRouter.post(
  "/upload",
  authenticate,
  uploadMiddleware,
  userController.uploadToS3
);
userRouter.post("/suggestions", authenticate, userController.getSuggestions);
userRouter.post("/smart-reply", authenticate, userController.getSmartReply);

module.exports = userRouter;
