const url = "http://localhost:4000";

const token = localStorage.getItem("token");

const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const userListEl = document.getElementById("userList");
const userSearchEl = document.getElementById("userSearch");
const chatNameEl = document.querySelector(".chat-meta .name");
const chatStatusEl = document.querySelector(".chat-meta .status");
const groupMembersDiv = document.getElementById("group-members-list");
const fileInput = document.getElementById("fileUpload");

const color1 = generateRandomColor();
const color2 = generateRandomColor();

const socket = io("ws://localhost:4000", {
  auth: { token },
});

window.addEventListener("DOMContentLoaded", () => initialize());

async function initialize() {
  if (!token) {
    alert("Token missing!!! please login");
    window.location.href = `${url}/login`;
    return;
  }

  const res = await fetch(`${url}/verify-token`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (res.status !== 200) {
    alert("Session Expired!!! please login again");
    window.location.href = `${url}/login`;
    return;
  }

  document.getElementById("navbar").style.display = "";
  document.getElementById("app").style.display = "";

  const userDetails = await fetch(`${url}/user/user-details`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const userData = await userDetails.json();

  document.getElementById("username").innerText = userData.name;
  window.user = userData;

  const allGroups = await fetch(`${url}/user/all-groups`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const allPersonalChats = await fetch(`${url}/user/all-personal-chats`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (allGroups.status === 200 || allPersonalChats.status === 200) {
    const reqGroups = (await allGroups.json()) || [];
    const personalChatsData = (await allPersonalChats.json()) || [];
    const allRooms = [...reqGroups, ...personalChatsData];

    renderRooms("", allRooms);

    if (userSearchEl) {
      userSearchEl.addEventListener("input", (e) =>
        renderRooms(e.target.value, allRooms)
      );
    }

    if (userListEl) {
      renderRooms("", allRooms);
      setTimeout(() => {
        const first = userListEl.querySelector(".user-item");
        if (first) first.click();
      }, 50);
    }
  }
}

socket.on("new-message", async (message) => {
  display(message.message, message);

  const res = await fetch(`${url}/user/smart-reply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ message: message.message, tone: "friendly" }),
  });

  const data = await res.json();

  const smartRepliesBox = document.getElementById("smart-replies");
  smartRepliesBox.innerHTML = (data.replies || [])
    .map((r) => `<button class="reply">${r}</button>`)
    .join("");

  document.querySelectorAll(".reply").forEach((btn) =>
    btn.addEventListener("click", () => {
      inputEl.value = btn.innerText;
      smartRepliesBox.innerHTML = "";
    })
  );
});

socket.on("leave-group", (object) => {
  display(object.message, null);
  if (object.removedId === window.user.id) {
    window.location.reload();
  }
});

socket.on("removed-user-notify", (object) => {
  if (object.removedId === window.user.id) {
    if (object.roomId === window.roomId) {
      alert("You were removed from this group");
      setInterval(() => {
        window.location.reload();
      }, 1000);
    }
  }
  const delMsg = document.createElement("p");
  delMsg.innerText = object.message;
  delMsg.style.color = "orange";
  groupMembersDiv.appendChild(delMsg);
});

socket.on("remove-personal-chat", (object) => {
  display(object.message, null);
  setTimeout(() => {
    window.location.reload();
  }, 1000);
});

socket.on("destroy-group", (object) => {
  display(object.message);
  setTimeout(() => {
    window.location.reload();
  }, 2000);
});

function display(message, name) {
  const el = createMsgEl(message.trim(), name || null);
  messagesEl.appendChild(el);
  scrollToBottom();
  inputEl.value = "";
  autoResize();
}

async function sendMessage(text, action) {
  const file = fileInput.files[0];
  if (file) {
    await sendingFile(file);
    return;
  }
  if (!text || !text.trim()) return;
  socket.emit("new-message", {
    message: text.trim(),
    roomName: window.roomName,
    isAction: action,
  });

  const res = await fetch(`${url}/user/suggestions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ text, tone: "casual" }),
  });

  const data = await res.json();

  const suggestionsBox = document.getElementById("suggestions");

  suggestionsBox.innerHTML = (data.suggestions || [])
    .map((s) => `<span class="suggestion">${s}</span>`)
    .join("");

  document.querySelectorAll(".suggestion").forEach((el) =>
    el.addEventListener("click", () => {
      inputEl.value += " " + el.innerText;
      suggestionsBox.innerHTML = "";
      inputEl.focus();
    })
  );
}

async function sendingFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${url}/user/upload`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  });

  const resData = await response.json();
  if (!resData.ok) {
    return;
  }

  socket.emit("new-message", {
    message: resData.fileUrl,
    roomName: window.roomName,
    isAction: false,
  });

  fileInput.value = "";
}

sendBtn.addEventListener("click", () => sendMessage(inputEl.value, false));

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage(inputEl.value, false);
  }
});

userSearchEl.addEventListener("keydown", async (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const email = userSearchEl.value;
    const myEmail = window.user.email;

    const user_exist = userExist(email);

    if (!user_exist) {
      return;
    }

    window.roomName = [myEmail, email].sort().join("_");

    socket.emit("leave-all-rooms");
    socket.emit("join-room", {
      roomName: window.roomName,
      isPrivate: true,
      email1: myEmail,
      email2: email,
    });
    alert("joined the room " + window.roomName);
    userSearchEl.value = "";

    window.location.reload();
  }
});

async function userExist(email) {
  const userExist = await fetch(`${url}/user/user-exist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ email }),
  });

  const exist = await userExist.json();

  if (exist.message) {
    alert(exist.message);
    return false;
  }

  if (!exist.exist) {
    alert("User does not exist");
    return false;
  }

  return true;
}

function generateRandomColor() {
  const arr = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
  ];

  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += arr[Math.floor(Math.random() * 16)];
  }

  return color;
}

function createMsgEl(text, name, time) {
  if (name === null) {
    const joinLeftMsg = document.createElement("div");
    joinLeftMsg.textContent = text;
    joinLeftMsg.className = "join-left-msg";
    return joinLeftMsg;
  } else if (name.name === null) {
    const joinLeftMsg = document.createElement("div");
    joinLeftMsg.textContent = text;
    joinLeftMsg.className = "join-left-msg";
    return joinLeftMsg;
  }
  const wrap = document.createElement("div");
  wrap.className = "msg " + (name.name === window.user.name ? "me" : "them");

  const nameDiv = document.createElement("span");
  nameDiv.innerHTML = `<span class="sender-name" style="color: ${name.name !== window.user.name ? color1 : color2};">${(name.name || "").substring(0, 8)}</span>`;

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (text.startsWith("https://groupchatapp123.s3")) {
    const ext = text.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      bubble.innerHTML = `<a href="${text}" target="_blank"><img src="${text}" width="200"></a>`;
    } else if (["mp4", "webm"].includes(ext)) {
      bubble.innerHTML = `<a href="${text}" target="_blank"><video controls width="250"><source src="${text}"></video></a>`;
    } else {
      bubble.innerHTML = `<a href="${text}" target="_blank" class="file-download">Open File</a>`;
    }
  } else {
    bubble.textContent = text;
  }

  const meta = document.createElement("div");
  meta.className = "meta";
  const ts = document.createElement("span");
  ts.className = "ts";
  ts.textContent = formatTime(time ? new Date(time) : new Date());
  meta.appendChild(ts);

  wrap.appendChild(nameDiv);
  wrap.appendChild(bubble);
  wrap.appendChild(meta);
  return wrap;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function autoResize() {
  inputEl.style.height = "auto";
  const h = Math.min(inputEl.scrollHeight, 200);
  inputEl.style.height = h + "px";
}

inputEl.addEventListener("input", autoResize);

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const hh = ((h + 11) % 12) + 1;
  const ampm = h >= 12 ? "PM" : "AM";
  return `${hh}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function renderRooms(filter, rooms) {
  userListEl.innerHTML = "";
  const q = (filter || "").toLowerCase();
  rooms
    .filter((u) => u.name.toLowerCase().includes(q))
    .forEach((u) => {
      const item = document.createElement("div");
      item.className = "user-item";
      item.roomId = u.id;

      const av = document.createElement("div");
      av.className = "user-avatar";
      av.textContent = u.name.charAt(0).toUpperCase();
      const meta = document.createElement("div");
      meta.className = "user-meta";
      const n = document.createElement("div");
      n.className = "name";
      n.textContent = u.name;
      // const l = document.createElement("div");
      // l.className = "last";
      // l.textContent = u.last;
      meta.appendChild(n);
      //meta.appendChild(l);

      item.appendChild(av);
      item.appendChild(meta);

      item.addEventListener("click", async () => {
        window.roomName = "";
        window.roomId = "";

        document.getElementById("group-members-container").style.display =
          "none";
        document
          .querySelectorAll(".user-item")
          .forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        chatNameEl.textContent = u.name;
        //chatStatusEl.textContent = u.online ? "Online" : "Last seen recently";
        document.getElementById("chat-header-avatar").innerText = u.name
          .charAt(0)
          .toUpperCase();
        if (u.isPersonal) {
          const personalChat = await chatExist(u.id);
          if (!personalChat) {
            item.remove();
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          } else {
            const deleteChat = document.createElement("button");
            deleteChat.setAttribute("id", "delete-chat");
            deleteChat.textContent = "delete chats";
            deleteChat.addEventListener("click", () => deleteChats(u.id, item));
            document.getElementById("chat-buttons").innerHTML = "";
            document.getElementById("chat-buttons").appendChild(deleteChat);
            socket.emit("leave-all-rooms");
            socket.emit("join-room", { roomName: u.roomName, isPrivate: true });
            window.roomId = u.id;

            messagesEl.innerHTML = "";
            window.roomName = u.roomName;

            getOldMessages(u.roomName);
            scrollToBottom();
          }
        } else {
          if (u.adminId === window.user.id) {
            document.getElementById("chat-buttons").innerHTML = "";
            addToGroupBtn(u.id);
            destroyGroupBtn(u.id, item);
          } else {
            const leaveGroupBtn = document.createElement("button");
            leaveGroupBtn.setAttribute("id", "leave-group");
            leaveGroupBtn.textContent = "Leave";
            leaveGroupBtn.addEventListener("click", () =>
              leaveGroup(u.id, u.roomName)
            );
            document.getElementById("chat-buttons").innerHTML = "";
            document.getElementById("chat-buttons").appendChild(leaveGroupBtn);
          }

          document.getElementById("group-members").style.display = "";
          document.getElementById("composer").style.display = "";

          const groupExist = await roomExist(u.id);
          if (!groupExist) {
            window.location.reload();
            return;
          }

          const isMemberCheck = await isMember(u.id);
          if (isMemberCheck) {
            socket.emit("leave-all-rooms");
            socket.emit("join-room", {
              roomName: u.roomName,
              isPrivate: false,
            });
            window.roomId = u.id;

            messagesEl.innerHTML = "";
            window.roomName = u.roomName;

            getOldMessages(u.roomName);
            scrollToBottom();
          } else {
            alert("you are removed from this group");
            window.location.reload();
          }
        }
      });

      userListEl.appendChild(item);
    });
}

async function deleteChats(id, div) {
  socket.emit("remove-personal-chat", { id });
  div.remove();
}
async function isMember(id) {
  const isMemberCheck = await fetch(`${url}/user/isMember?groupId=${id}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const isMemberData = await isMemberCheck.json();

  if (isMemberData.exist) {
    return true;
  }

  return false;
}

async function chatExist(id) {
  const chatExist = await fetch(`${url}/user/chat-exist?roomId=${id}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (chatExist.status !== 200) {
    alert("Internal server error");
    return;
  }

  const chatExistData = await chatExist.json();

  return chatExistData.exist;
}

async function roomExist(roomId) {
  const exist = await fetch(`${url}/user/group-exist?groupId=${roomId}`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (exist.status !== 200) {
    alert("Internal server error");
    return false;
  }

  const existData = await exist.json();

  if (!existData.exist) {
    alert("group has been destroyed by admin");
    return false;
  }

  return existData.exist;
}

function addToGroupBtn(groupId) {
  const addUserBtn = document.createElement("button");
  addUserBtn.setAttribute("id", "add-friend");
  addUserBtn.textContent = "Add";
  addUserBtn.addEventListener("click", () => addToGroup(groupId));
  document.getElementById("chat-buttons").appendChild(addUserBtn);
}

function destroyGroupBtn(groupId, item) {
  const destroyBtn = document.createElement("button");
  destroyBtn.setAttribute("id", "destroy-group");
  destroyBtn.textContent = "destroy";
  destroyBtn.addEventListener("click", () => destroyGroup(groupId, item));
  document.getElementById("chat-buttons").appendChild(destroyBtn);
}

async function destroyGroup(groupId, item) {
  socket.emit("destroy-group", { groupId });
  item.remove();
}

async function getOldMessages(roomName) {
  const messages = await fetch(
    `${url}/user/get-messages?roomName=${roomName}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const messageData = (await messages.json()) || [];

  messagesEl.innerHTML = "";
  for (let i = 0; i < messageData.length; i++) {
    const el = createMsgEl(
      messageData[i].message,
      messageData[i].user || null,
      messageData[i].createdAt
    );
    messagesEl.appendChild(el);
    scrollToBottom();
    inputEl.value = "";
    autoResize();
  }
}

async function addToGroup(groupId) {
  const userEmail = prompt("Enter user email: ");
  const user_exist = userExist(userEmail);

  if (!user_exist) {
    return;
  }

  const addToGroup = await fetch(`${url}/user/add-to-group`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ userEmail, roomId: groupId }),
  });

  const addData = await addToGroup.json();

  if (addToGroup.status !== 200) {
    const msg = document.getElementById("message-error");
    msg.innerText = addData.message;
    msg.style.color = "red";
    setTimeout(() => {
      msg.innerText = "";
    }, 1500);
    return;
  }

  sendMessage(addData.message, true);
}

async function leaveGroup(groupId, roomName) {
  socket.emit("leave-group", {
    groupId,
    id: window.user.id,
    name: window.user.name,
    roomName,
  });
}

document.getElementById("create-group").addEventListener("click", () => {
  window.location.href = `${url}/user/create-group`;
});

document
  .getElementById("group-members")
  .addEventListener("click", () => renderGroupMembers());

document
  .getElementById("chat-header-avatar")
  .addEventListener("click", () => renderGroupMembers());

if (document.getElementById("search-group-member")) {
  document
    .getElementById("search-group-member")
    .addEventListener("input", (e) => renderGroupMembers(e.target.value));
}

async function renderGroupMembers(entry) {
  const q = entry || "";
  document.getElementById("composer").style.display = "none";
  messagesEl.innerHTML = "";

  document.getElementById("search-group-member").style.display = "";

  document.getElementById("group-members-container").style.display = "";
  groupMembersDiv.innerHTML = "";

  const groupMembers = await fetch(
    `${url}/user/group-members?groupId=${window.roomId}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  if (groupMembers.status !== 200) {
    alert("Members cannot be fetched at the moment");
    window.location.href = `${url}/user`;
    return;
  }

  const groupData = await groupMembers.json();
  const groupMembersList = groupData.groupMembersList;
  groupMembersList
    .filter((member) => member.name.includes(q))
    .forEach((member) => {
      const userDiv = document.createElement("div");
      userDiv.innerText = member.name;
      userDiv.className = "user-item member-item";
      if (member.id === groupData.adminId) {
        const adminDiv = document.createElement("div");
        adminDiv.innerText = "admin";
        adminDiv.className = "admin-badge";
        userDiv.appendChild(adminDiv);
      }

      if (
        window.user.id === groupData.adminId &&
        member.id !== groupData.adminId
      ) {
        const deleteUserBtn = document.createElement("button");
        deleteUserBtn.innerText = "remove";
        deleteUserBtn.classList.add("remove-btn");
        deleteUserBtn.addEventListener("click", () =>
          removeUserFromGroup(member.id, userDiv)
        );
        userDiv.appendChild(deleteUserBtn);
      }

      groupMembersDiv.appendChild(userDiv);
    });
}

async function removeUserFromGroup(id, div) {
  socket.emit("removed-user-notify", {
    removedUserId: id,
    roomId: window.roomId,
  });

  div.remove();
}

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("token");

  setTimeout(() => {
    window.location.href = `${url}`;
  }, 1000);
});
