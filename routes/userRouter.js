const express = require("express");
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticationToken");
const uploadMiddleware = require("../middleware/uploadMiddleware");

const userRouter = express.Router();

userRouter.get("/", userController.accountPage);
userRouter.get("/user-details", authenticate, userController.getUserDetails);
userRouter.get("/get-messages", authenticate, userController.getOldMessages);
userRouter.post("/user-exist", authenticate, userController.userExists);
userRouter.get("/create-group", userController.createGroupPage);
userRouter.post("/create-group", authenticate, userController.createGroup);
userRouter.get("/all-groups", authenticate, userController.getUserGroups);
userRouter.put("/add-to-group", authenticate, userController.addToGroup);
userRouter.get("/group-members", authenticate, userController.getGroupMembers);
userRouter.delete("/remove-group", authenticate, userController.destroyGroup);
userRouter.get("/isMember", authenticate, userController.isMember);
userRouter.get("/group-exist", authenticate, userController.groupExist);
userRouter.get(
  "/all-personal-chats",
  authenticate,
  userController.personalChats
);
userRouter.get("/chat-exist", authenticate, userController.chatExist);
userRouter.post(
  "/upload",
  authenticate,
  uploadMiddleware,
  userController.uploadFile
);
userRouter.post("/smart-reply", authenticate, userController.smartReply);
userRouter.post("/suggestions", authenticate, userController.suggestions);

module.exports = userRouter;
