const path = require("path");

const express = require("express");

const app = express();

app.get("/sign-up", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(
    `connection eshtablished successfully http://localhost:4000/sign-up`
  );
});
