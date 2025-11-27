const url = "http://localhost:4000";
const token = localStorage.getItem("token");

document.addEventListener("DOMContentLoaded", () => initialize());

async function initialize() {
  if (!token) {
    alert("Token missing");
    window.location.href = url;
    return;
  }

  const verifyToken = await fetch(`${url}/verify-token`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  if (verifyToken.status !== 200) {
    localStorage.removeItem("token");
    alert("Token expired!");
    window.location.href = url;
    return;
  }

  document.getElementById("main").style.display = "";

  const userDetails = await fetch(`${url}/user/user-details`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const userData = await userDetails.json();
  window.user = userData;
}

const form = document.getElementById("createGroupForm");

async function handleOnSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("groupName").value.trim();
  if (!name) {
    alert("Please enter a group name");
    return;
  }

  const createGroup = await fetch(`${url}/user/create-group`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ name, adminId: window.user.id }),
  });

  const data = await createGroup.json();

  const comment = document.getElementById("comment");

  comment.innerText = data.message;
  comment.style.fontSize = "30px";

  if (createGroup.status === 201) {
    comment.style.color = "green";
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  } else {
    comment.style.color = "red";
  }
}
