const url = "http://localhost:4000";

const comment = document.getElementById("comment");

async function handleOnSubmit(e) {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const phone = e.target.phone.value;
  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;

  const createUser = await fetch(`${url}/sign-up`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, phone, password, confirmPassword }),
  });

  const data = await createUser.json();

  comment.innerText = data.message;

  if (createUser.status === 201) {
    comment.style.color = "green";
    setTimeout(() => {
      window.location.href = `${url}/login`;
    }, 1000);
  } else {
    comment.style.color = "red";
  }
}
