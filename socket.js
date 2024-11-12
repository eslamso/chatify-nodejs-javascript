const socketIo = require("socket.io");
const moment = require("moment");
const redisClient = require("./services/redisService");
const userModel = require("./models/userModel");
const formatMessage = require("./utils/messages");
const Message = require("./models/messageModel");
const Chat = require("./models/chatModel");

const getUserName = async (id) => {
  const user = await userModel.findById(id);
  if (!user) {
    return;
  }
  const userName = user.firstName + user.lastName;
  return userName;
};
module.exports = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: true,
      credentials: true, //access-control-allow-credentials:true
      optionSuccessStatus: 200,
    },
  });

  io.on("connection", async (socket) => {
    console.log(`user ${socket.id} connected to socket `);
    let cUser;
    let currentChatt;
    let oUser;

    socket.on("joinRoom", async ({ currentUser, currentChat }) => {
      //connectedUsers.push(currentUser);
      socket.user = currentUser;
      currentChatt = currentChat;
      //create user join on specified room
      //const user = userJoin(socket.id, username, room);
      // user join room
      const chat = await Chat.findById(currentChat);
      console.log("currentUser", currentUser, "chat", currentChat);
      socket.join(currentChat);
      cUser = await userModel.findById(currentUser);
      cUser.isOnline = true;
      await cUser.save();
      const userName = cUser.firstName + cUser.lastName;
      await redisClient.set(socket.id, currentUser);

      socket.broadcast.to(currentChat).emit("updateOnline", userName);
      const sockets = await io.in(currentChat).fetchSockets();
      if (sockets.length === 2) {
        let userName;
        if (chat.user1._id != currentUser) {
          userName = chat.user1.firstName + chat.user1.lastName;
        } else {
          userName = chat.user2.firstName + chat.user2.lastName;
        }
        oUser = userName;
        socket.emit("updateOnline", userName);
        chat.messages.forEach((message) => {
          if (message.receiver) {
            if (
              !message.isDelivered &&
              message.receiver.toString() === socket.user
            ) {
              message.isDelivered = true;
              console.log("a7aaaaaa");
            }
          }
        });

        await chat.save();
        const currentUserName = cUser.firstName + cUser.lastName;
        socket.broadcast
          .to(currentChat)
          .emit("deliverMessage", currentUserName);
      }
      // socket.on("online", async (currentUser) => {

      // });
      // send message to everyone in the specified room except current user who join to currentChat
      // chat and users info

      // io.to(user.room).emit("roomUsers", {
      //   room: user.room,
      //   users: getRoomUsers(user.room),
      // });
    });
    // let user = {};
    // console.log(socket.user);
    // userModel.findById(socket.user).then((x) => {
    //   user = x;
    //   console.log("user", x);
    // });

    // listen to chatMessage

    socket.on("chatMessage", async ({ msg, currentChat, currentUser }) => {
      //1-message Schema
      console.log(currentUser);
      const chat = await Chat.findById(currentChat);
      let receiver;
      if (chat.user1._id != currentUser) {
        receiver = chat.user1._id;
      } else {
        receiver = chat.user2._id;
      }
      const message = new Message({
        receiver: receiver,
        content: msg,
        sender: currentUser,
        sentAt: Date.now(),
        isSent: true,
      });
      //2- getting chat
      const sockets = await io.in(currentChat).fetchSockets();
      if (sockets.length === 2) {
        message.isDelivered = true;
      }
      chat.messages.push(message);
      chat.lastSentMessage = message._id;
      await chat.save();
      io.to(currentChat).emit("message", { message, currentChat }); // send message to everyone
    });
    socket.on("typing", ({ chatName, chat }) => {
      socket.broadcast.to(chat).emit("typing", { chatName, chat });
    });
    socket.on("no typing", ({ chatName, chat }) => {
      socket.broadcast.to(chat).emit("no typing", { chatName, chat });
    });
    socket.on(
      "readMessage",
      async ({ currentUserName, currentChat, currentUser }) => {
        console.log(currentChat, "ctx");
        const chat = await Chat.findById(currentChat);
        chat.messages.forEach((message) => {
          if (!message.isSeen && message.receiver.toString() === currentUser) {
            message.isSeen = true;
          }
        });
        await chat.save();
        socket.broadcast.to(currentChat).emit("readMessage", {
          currentUserName,
          currentChat,
        });
      }
    );
    // listen to disconnect
    socket.on("disconnect", async () => {
      // send message to everyone that a user left
      const userId = await redisClient.get(socket.id);
      const userName = await getUserName(userId);
      const user = await userModel.findByIdAndUpdate(
        userId,
        {
          lastAppearance: Date.now(),
          isOnline: false,
        },
        { new: true }
      );
      let lastAppearance;
      if (user) {
        lastAppearance = moment(user.lastAppearance).format("LT");
      }
      console.log("user2", userName, userId);
      io.emit("updateOffline", { userName, lastAppearance });
      // send room and users info
    });
  });
  return io;
};
