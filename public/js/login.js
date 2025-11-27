const url = "http://localhost:4000";

const comment = document.getElementById("comment");

async function handleOnSubmit(e) {
  e.preventDefault();

  const email_phone = e.target.email_phone.value;
  const password = e.target.password.value;

  const loginUser = await fetch(`${url}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_phone, password }),
  });

  const data = await loginUser.json();

  localStorage.setItem("token", data.token);
  comment.innerText = data.message;

  if (loginUser.status === 200) {
    comment.style.color = "green";
    setTimeout(() => {
      window.location.href = `${url}/user`;
    }, 1000);
  } else {
    comment.style.color = "red";
  }
}
