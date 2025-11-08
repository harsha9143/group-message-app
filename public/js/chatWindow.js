window.addEventListener("DOMContentLoaded", () => initialize());
const token = localStorage.getItem("token");
const socket = new WebSocket(`ws://localhost:4000`);

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

  chatBox.innerHTML = "";
  const messages = await fetch(`http://localhost:4000/user/get-messages`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const messageData = await messages.json();

  for (let i = 0; i < messageData.length; i++) {
    display(messageData[i]);
  }
}

function display(msg) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", "sent");
  msgDiv.innerHTML = `<p>${msg.message}</p><span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

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
  socket.send(msg);
  input.value = "";
});

socket.onmessage = async (event) => {
  const messageText = await event.data.text();

  display({
    message: messageText,
    createdAt: new Date(),
  });
};
