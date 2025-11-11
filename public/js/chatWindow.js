window.addEventListener("DOMContentLoaded", () => initialize());
const token = localStorage.getItem("token");

const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("messageInput");
const fileInput = document.getElementById("fileInput");
const sendFileBtn = document.getElementById("sendFileBtn");

async function userDetails() {
  const userDetails = await fetch(`http://localhost:4000/user/user-details`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const userData = await userDetails.json();

  return userData;
}

async function initialize() {
  if (!token) {
    alert("Login first");
    window.location.href = `http://localhost:4000/login`;
    return;
  }

  const res = await fetch(`http://localhost:4000/verify-token`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (res.status !== 200) {
    alert("session expired");
    localStorage.removeItem("token");
    window.location.href = `http://localhost:4000/login`;
    return;
  }

  document.getElementById("chat-container").style.display = "";
  document.getElementById("chat-header").style.display = "";

  const details = await userDetails();

  localStorage.setItem("details", JSON.stringify(details));

  document.getElementById("username").innerText = details.name;
}

async function getOldMessages(roomName) {
  chatBox.innerHTML = "";
  const messages = await fetch(
    `http://localhost:4000/user/get-messages?roomName=${roomName}`,
    {
      headers: {
        Authorization: "Bearer " + token,
      },
    }
  );

  const messageData = await messages.json();

  const details = JSON.parse(localStorage.getItem("details"));

  for (let i = 0; i < messageData.length; i++) {
    display(messageData[i], messageData[i].user.name, details.id);
  }
}

function display(msg, name, id) {
  const msgDiv = document.createElement("div");
  if (id === msg.userId) {
    msgDiv.classList.add("message", "sent");
  } else {
    msgDiv.classList.add("message", "received");
  }

  if (msg.mediaUrl) {
    const ext = msg.mediaUrl.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      msgDiv.innerHTML = `<span class="name">${name}</span><img src="${msg.mediaUrl}" width="200"><span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;
    } else if (["mp4", "webm"].includes(ext)) {
      msgDiv.innerHTML = `<span class="name">${name}</span><video controls width="250"><source src="${msg.mediaUrl}"></video>`;
    } else {
      msgDiv.innerHTML = `<span class="name">${name}</span><a href="${msg.mediaUrl}" target="_blank">Download file</a>`;
    }
  } else if (msg.message.startsWith("https://groupchatapp123.s3")) {
    const ext = msg.message.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext)) {
      msgDiv.innerHTML = `<span class="name">${name}</span><img src="${msg.mediaUrl}" width="200"><span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;
    } else if (["mp4", "webm"].includes(ext)) {
      msgDiv.innerHTML = `<span class="name">${name}</span><video controls width="250"><source src="${msg.mediaUrl}"></video>`;
    } else {
      msgDiv.innerHTML = `<span class="name">${name}</span><a href="${msg.mediaUrl}" target="_blank">Download file</a>`;
    }
  } else {
    msgDiv.innerHTML = `<span class="name">${name || msg.username}</span><p>${msg.message}</p><span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;
  }

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

const socket = io(`ws://localhost:4000`, {
  auth: { token },
});

sendBtn.addEventListener("click", async () => {
  const msg = input.value.trim();
  if (!msg || msg.length === 0) return;

  socket.emit("new-message", { message: msg, roomName: window.roomName });
  input.value = "";
});

socket.on("new-message", async (message) => {
  const details = JSON.parse(localStorage.getItem("details"));
  display(message, message.username, details.id);
});

document
  .getElementById("searchbar")
  .addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      const myself = JSON.parse(localStorage.getItem("details")).email;
      const other = event.target.value;
      event.target.value = "";
      const userExists = await fetch(`http://localhost:4000/user/user-exists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ email: other }),
      });

      const exists = await userExists.json();

      if (exists.exists) {
        window.roomName = [myself, other].sort().join("_");
        socket.emit("join-room", window.roomName);
        alert("joined the room" + window.roomName);
        getOldMessages(window.roomName);
      } else if (userExists.status === 500) {
        alert("Internal server error");
      } else {
        alert("User with entered email doesnot exist");
      }
    }
  });

document
  .getElementById("searchGroup")
  .addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      const groupName = event.target.value;
      event.target.value = "";

      window.roomName = groupName;
      socket.emit("join-room", window.roomName);
      alert("joined the group: " + window.roomName);
      getOldMessages(window.roomName);
    }
  });

sendFileBtn.addEventListener("click", async () => {
  console.log("Button clicked");
  const file = fileInput.files[0];

  console.log(file);

  if (!file) {
    alert("Please select a file first");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:4000/user/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    body: formData,
  });

  const data = await response.json();

  if (!data.ok) {
    return;
  }
  const mediaUrl = data.fileUrl;

  socket.emit("new-media", { mediaUrl, roomName: window.roomName });

  fileInput.value = "";
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");

  setTimeout(() => {
    window.location.href = "http://localhost:4000/login";
  }, 1000);
});
