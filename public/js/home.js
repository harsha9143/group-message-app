window.addEventListener("DOMContentLoaded", () => initialize());

function initialize() {
  const token = localStorage.getItem("token");

  if (!token) {
    localStorage.removeItem("token");
    document.getElementById("hero").style.display = "";
  } else {
    window.location.href = "http://localhost:4000/user";
  }
}
