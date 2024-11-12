const asyncHandler = require("express-async-handler");
const redisClient = require("./redisService");
const chatModel = require("../models/chatModel");
const AppError = require("../utils/CustomError");

/**
 * Description : get all chats of logged in user
 * */
exports.getAllChats = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  const userId = await redisClient.get(token);

  /**
   * TODO: This Query Needed To Be optimized
   * */

  const chats = await chatModel
    .find({ $or: [{ user1: userId }, { user2: userId }] })
    .select("_id user1 user2 lastSentMessage")
    .populate("lastSentMessage")
    .lean();

  for (const chat of chats) {
    if (chat.user1._id.toString() === userId) {
      chat.user = chat.user2;
    } else {
      chat.user = chat.user1;
    }
    delete chat.user1;
    delete chat.user2;
  }

  res.status(200).json({
    status: "Success",
    chats,
  });
});

exports.getChatById = asyncHandler(async (req, res, next) => {
  // First Make Sure the chat User Is Requesting Belong to this user
  const token = req.cookies.token;
  const userId = await redisClient.get(token);
  const chatId = req.params.chatId;

  const chat = await chatModel.findById(chatId).lean();
  if (!chat) {
    res.status(404).json({
      status: "Not Found",
    });
  }

  if (chat.user1._id.toString() !== userId) {
    chat.user = chat.user1;
  } else {
    chat.user = chat.user2;
  }
  delete chat.user1;
  delete chat.user2;
  delete chat.lastSentMessage;

  res.status(200).json({
    status: "success",
    chat,
  });
});

exports.createChat = asyncHandler(async (req, res, next) => {
  const { user1, user2 } = req.body;
  const chat = await chatModel.findOne({
    $or: [
      { user1: user1, user2: user2 },
      { user1: user2, user2: user1 },
    ],
  });
  if (chat) {
    return next(
      new AppError(400, "there is already a chat between user1 and user2")
    );
  }
  const newChat = await chatModel.create({ user1, user2 });
  res.status(201).json({
    status: "success",
    newChat,
  });
});
exports.getAllChat = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const chats = await chatModel.find({
    $or: [{ user1: userId }, { user2: userId }],
  });
  res.status(200).json({
    status: "success",
    chats,
  });
});
