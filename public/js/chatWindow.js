window.addEventListener("DOMContentLoaded", () => initialize());
const token = localStorage.getItem("token");

const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("messageInput");

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

  const userDetails = await fetch(`http://localhost:4000/user/user-details`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const userData = await userDetails.json();

  document.getElementById("username").innerText = userData.name;

  chatBox.innerHTML = "";
  const messages = await fetch(`http://localhost:4000/user/get-messages`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const messageData = await messages.json();

  for (let i = 0; i < messageData.length; i++) {
    display(messageData[i], messageData[i].user.name, userData);
  }
}

function display(msg, name, userData) {
  const msgDiv = document.createElement("div");
  //const username = msg.username || name;
  if (userData.id === msg.userId) {
    msgDiv.classList.add("message", "sent");
  } else {
    msgDiv.classList.add("message", "received");
  }

  msgDiv.innerHTML = `<span class="name">${name || msg.username}</span><p>${msg.message}</p><span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

const socket = io(`ws://localhost:4000`, {
  auth: { token },
});

sendBtn.addEventListener("click", async () => {
  const msg = input.value.trim();
  if (!msg || msg.length === 0) return;

  // await fetch("http://localhost:4000/user/send-message", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: "Bearer " + token,
  //   },
  //   body: JSON.stringify({ message: msg }),
  // });
  socket.emit("new-message", msg);
  input.value = "";
});

// socket.onmessage = async (event) => {
//   const messageText = await event.data.text();

//   display({
//     message: messageText,
//     createdAt: new Date(),
//   });
// };

socket.on("new-message", (message) => {
  display(message);
});

document.getElementById("search").addEventListener("keydown", (event) => {
  if (event.key == "enter") {
    const email = event.target.search.value;

    socket.emit("join-room", email);
  }
});
