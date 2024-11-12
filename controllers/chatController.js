const express = require("express");
const chatService = require("../services/chatService");
const { protect } = require("../services/authService");

const chatRouter = express.Router();

chatRouter
  .route("/")
  .get(protect, chatService.getAllChat)
  .post(chatService.createChat);
chatRouter.route("/:chatId").get(protect, chatService.getChatById);
//chatRouter.get("/", protect, chatService.getAllChat).post(chatService.createChat);

module.exports = chatRouter;
