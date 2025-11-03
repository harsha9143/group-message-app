const { json } = require("stream/consumers");

const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("messageInput");

sendBtn.addEventListener("click", async () => {
  const msg = input.value.trim();
  if (!msg) return;

  const storeMessage = await fetch("http://localhost:4000/user/send-message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: msg }),
  });

  const data = await storeMessage.json();

  if (storeMessage.status !== 201) {
    const sentStatus = document.getElementById("sent-status");
    sentStatus.textContent = data.message;
    sentStatus.style.color = "red";
  } else {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", "sent");
    msgDiv.innerHTML = `<p>${msg}</p><span class="timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    input.value = "";
  }
});
