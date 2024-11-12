const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.querySelector("#room-name");
const userList = document.getElementById("users");
const socket = io();

//get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const currentUserName = localStorage.getItem("currentUserName");
const deliveredMessages = [];
const unDeliveredMessages = [];
const readMessages = [];
let currentChat = "";
console.log(username, room);
let selectedChat = "";
const currentUser = localStorage.getItem("currentUserId");
let userContacts = {};
// getting all user chats
axios.get("http://localhost:3000/api/v1/chat").then(({ data }) => {
  const userChats = data.chats;
  console.log(userChats);
  const currentUserId = localStorage.getItem("currentUserId");
  if (!currentUserId) {
    alert("you are not logged in please log in");
  }

  userChats.forEach((chat) => {
    let otherUser = "";
    if (chat.user1._id !== currentUserId) {
      otherUser = chat.user1;
    } else {
      otherUser = chat.user2;
    }
    currentChat = chat._id;
    otherUser.userName = outputChat(chat, otherUser);
    const currentUser = localStorage.getItem("currentUserId");
    socket.emit("joinRoom", { currentUser, currentChat });
    userContacts[`${otherUser.userName}`] = chat;
  });
  // get specific chat
  const chatsList = document.querySelectorAll(".chat-item");
  chatsList.forEach((chat, index) => {
    chat.addEventListener("click", (e) => {
      document.querySelectorAll(".chat-messages").forEach((dive, i) => {
        dive.style.display = "none";
      });
      document.querySelectorAll(".chat-name").forEach((x) => {
        x.style.display = "none";
        x.classList.remove("clicked");
      });
      chatsList.forEach((c) => {
        c.style["background-color"] = "#7386ff";
        if (c !== chat) {
          c.classList.remove("clicked");
        }
      });
      chat.classList.add("clicked");
      const currentChatIconName = chat.querySelector(".chat-namee").innerText;

      //console.log(chat.querySelector(".chat-name").innerText);
      const chatDivFounded = document.querySelector(`.${currentChatIconName}`);
      //   console.log("selected chat", chatDivFounded);
      //console.log(document.querySelector(".chat-messages"));
      const chatHeader = document.querySelector(
        `.${currentChatIconName}${currentChatIconName}`
      );
      if (!chatDivFounded) {
        const div = document.createElement("div");
        div.classList.add("chat-messages");
        document
          .querySelector(".chat-main")
          .insertBefore(div, document.querySelector(".chat-form-container"));
      }
      selectedChat = chatDivFounded;
      chatDivFounded.style.display = "block";
      chatHeader.style.display = "block";
      //chatHeader.classList.add("clicked");

      // display name of chat
      //document.querySelector(".c-name").innerText = currentChatIconName;

      chat.style["background-color"] = "white";
      //adding query params
      currentChat = userContacts[currentChatIconName]._id;
      addQueryParams(`${currentChat}`);
      // read message and update database
      socket.emit("readMessage", { currentUserName, currentChat, currentUser });

      // join chat with socket
      // join chat room
      //  console.log(chatDivFounded.classList.contains("clicked"));
      // if (!chat.classList.contains("clicked")) {
      //   chat.classList.add("clicked");
      //   socket.emit("joinRoom", { currentUser, currentChat });
      // }
    });
  });
});

//get users and room info
// socket.on("roomUsers", ({ room, users }) => {
//   outputRoomName(room);
//   outputUsers(users);
// });
// update user status online || offline
socket.on("updateOnline", (userName) => {
  const chatHeader = document.querySelector(`.${userName}${userName}`);
  chatHeader.querySelector(".lastSeen").innerText = "online";
});
socket.on("updateOffline", ({ userName, lastAppearance }) => {
  const chatHeader = document.querySelector(`.${userName}${userName}`);
  //const formattedTime = moment(lastAppearance).format("LT");
  chatHeader.querySelector(".lastSeen").innerText = `${lastAppearance}`;
});

// message from server
socket.on("message", ({ message, currentChat }) => {
  let chat = "";
  let chatName;
  for (const [key, value] of Object.entries(userContacts)) {
    if (value._id === currentChat) {
      chat = document.querySelector(`.${key}`);
      chatName = key;
      break;
    }
  }
  console.log("key", chat);
  outputMessage(message, chat);
  chat.scrollTop = chat.scrollHeight;
  const lastMessage = document
    .querySelector(`.${chatName}${chatName}${chatName}`)
    .querySelector(".chat-last-message");
  const lastSentMessage = chat.lastElementChild.querySelector(".text");
  lastMessage.innerText = lastSentMessage.innerText.trim();
  // console.log(lastSentMessage.innerText.trim(), "lastSentMessage");
  // lastMessage.innerText = lastSentMessage.innerText.trim();
});

// message submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  //console.log(msg);
  // send message to server
  socket.emit("chatMessage", { msg, currentChat, currentUser });
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output chats to dom
const outputChat = (chat, otherUser) => {
  const userName = otherUser.firstName + otherUser.lastName;
  let lastTime;
  let content;
  const lastMessage = chat.lastSentMessage;
  if (!lastMessage) {
    lastTime = moment().format("LT");
    content = "start new conservation";
  } else {
    content = lastMessage.content;
    lastTime = lastMessage.sentAt;
    lastTime = moment(lastTime).format("LT");
  }

  const div = document.createElement("li");
  div.classList.add("chat-item");
  div.classList.add(`${userName}${userName}${userName}`);

  div.innerHTML = ` <div class="chat-avatar">
                <img src="https://via.placeholder.com/50" alt="Avatar" />
              </div>
              <div class="chat-info">
                <h4 class="chat-namee">${userName}</h4>
                <p class="chat-last-message">${content}</p>
              </div>
              <div class="chat-time">${lastTime}</div>`;
  document.querySelector(".chat-list").appendChild(div);

  // creating chat div
  const chatDiv = document.createElement("div");
  chatDiv.classList.add("chat-messages");
  chatDiv.classList.add(userName);
  document
    .querySelector(".chat-main")
    .insertBefore(chatDiv, document.querySelector(".chat-form-container"));

  chatDiv.style.display = "none";
  const chatHeader = document.createElement("div");
  chatHeader.classList.add("chat-name");
  chatHeader.classList.add(userName + userName);
  const chatNameP = document.createElement("p");
  chatNameP.innerText = userName;
  chatNameP.classList.add("c-name");
  const onlineStatus = document.createElement("p");
  onlineStatus.classList.add("lastSeen");
  if (otherUser.isOnline) {
    onlineStatus.innerText = "Online";
    onlineStatus.style.color = "green";
  } else {
    onlineStatus.innerText = `${moment(otherUser.lastAppearance).format("LT")}`;
  }
  chatHeader.appendChild(chatNameP);
  chatHeader.appendChild(onlineStatus);
  document
    .querySelector(".chat-header")
    .insertBefore(chatHeader, document.querySelector("#logout"));
  chatHeader.style.display = "none";
  chat.messages.forEach((message) => {
    outputMessage(message, chatDiv);
  });

  return userName;
};

// output message to dom
const outputMessage = (msg, chatMessages) => {
  const div = document.createElement("div");
  const formattedDate = moment(msg.sentAt).format("LT");
  div.classList.add("message");
  div.innerHTML = `<p class="meta"> <span>${formattedDate}</span></p>
            <p class="text">
             ${msg.content}
            </p>
`;
  console.log(`${msg.sender}+ ${currentUser}`);
  if (msg.sender === currentUser) {
    const checkMark = document.createElement("i");
    if (msg.isDelivered)
      checkMark.innerHTML = "<i class='fas fa-check-double'></i>";
    else {
      checkMark.innerHTML = "<i class='fas fa-check'></i>";
    }

    if (msg.isSeen) {
      checkMark.style.color = "red";
    } else {
      checkMark.style.color = "gray";
      deliveredMessages.push(div);
    }
    if (!msg.isDelivered) {
      unDeliveredMessages.push(div);
    }
    div.appendChild(checkMark);
    div.style.transform = "translateX(100%)";
    div.style.backgroundColor = "#7386ff";
  }
  chatMessages.appendChild(div);
};

const outputRoomName = (room) => {
  roomName.innerText = room;
};

const outputUsers = (users) => {
  userList.innerHTML = "";
  users.map((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
};

const addQueryParams = (chatId) => {
  const urlSearchParams = new URLSearchParams(location.search);
  urlSearchParams.set("chat", chatId);
  history.pushState({}, "", `?${urlSearchParams.toString()}`);
};

document.querySelector("#msg").addEventListener("input", function () {
  console.log(document.querySelector("#msg").value);
  // const chatName = document
  //   .querySelector(".clicked")
  //   .querySelector(".chat-namee").innerText;
  if (document.querySelector("#msg").value != "") {
    console.log("a7a");
  }
  const { chat } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
  });
  const chatName = currentUserName;
  if (document.querySelector("#msg").value != "") {
    socket.emit("typing", { chatName, chat });
    // console.log(document.querySelector("#msg").value, chat, chatName);
  } else {
    socket.emit("no typing", { chatName, chat });
  }
});

socket.on("typing", ({ chatName, chat }) => {
  const chatHeader = document.querySelector(`.${chatName}${chatName}`);
  const lastMessage = document
    .querySelector(`.${chatName}${chatName}${chatName}`)
    .querySelector(".chat-last-message");
  lastMessage.innerText = "typing...";
  chatHeader.querySelector(".lastSeen").innerText = "typing ...";
});
socket.on("no typing", ({ chatName, chat }) => {
  const chatHeader = document.querySelector(`.${chatName}${chatName}`);
  const lastMessage = document
    .querySelector(`.${chatName}${chatName}${chatName}`)
    .querySelector(".chat-last-message");
  const lastSentMessage = document
    .querySelector(`.${chatName}`)
    .lastElementChild.querySelector(".text");
  console.log(lastSentMessage.innerText.trim(), "lastSentMessage");
  lastMessage.innerText = lastSentMessage.innerText.trim();
  lastMessage.style.color = "black";
  chatHeader.querySelector(".lastSeen").innerText = "online";
});
//document.querySelector(".current-user-name").innerText = username;
socket.on("readMessage", ({ currentUserName, currentChat }) => {
  console.log(currentUserName, "currentUserName");
  // const parent = document.querySelector(`.${currentUserName}`);

  deliveredMessages.forEach((message, index) => {
    if (message.parentElement.classList.contains(currentUserName)) {
      message.querySelector(".fas").style.color = "red";
      console.log(message.querySelector("i"));
    }
  });
});

socket.on("deliverMessage", (currentUserName) => {
  // console.log(currentUserName, "currentUserName", "deliveredMessage");
  // const parent = document.querySelector(`.${currentUserName}`);

  unDeliveredMessages.forEach((message, index) => {
    if (message.parentElement.classList.contains(currentUserName)) {
      message.querySelector(".fas").className = "fas fa-check-double";

      message.querySelector(".fas").style.color = "grey";
      //  console.log(message.querySelector("i"), "dddd");
    }
  });
});
