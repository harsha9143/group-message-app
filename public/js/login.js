async function handleOnSubmit(e) {
  e.preventDefault();

  const emailPhone = e.target.emailPhone.value;
  const password = e.target.password.value;

  const loginUser = await fetch("http://localhost:4000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ emailPhone, password }),
  });

  const data = await loginUser.json();

  const msg = document.getElementById("message");
  msg.textContent = data.message;

  if (loginUser.status === 200) {
    msg.style.color = "green";
    // setTimeout(() => {
    //   window.location.href = "http://localhost:4000/login";
    // }, 1500);
  } else {
    msg.style.color = "red";
  }
}
