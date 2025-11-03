const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("sendBtn");
const input = document.getElementById("messageInput");

sendBtn.addEventListener("click", () => {
  const msg = input.value.trim();
  if (!msg) return;

  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", "sent");
  msgDiv.innerHTML = `<p>${msg}</p><span class="timestamp">${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>`;

  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  input.value = "";
});
