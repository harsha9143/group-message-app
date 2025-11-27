//core modules
const path = require("path");
const http = require("http");

//third party modules
const express = require("express");
require("dotenv").config();

//local modules
const sequelize = require("./utils/databaseUtil");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const { authenticate } = require("./middleware/authenticationToken");
const Message = require("./models/message");
const User = require("./models/user");
const socketIO = require("./socket_io");
const cronJob = require("./services/cronService");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

User.hasMany(Message);
Message.belongsTo(User);

app.use("/", authRouter);
app.use("/user", userRouter);

app.get("/verify-token", authenticate, (req, res) => {
  res.status(200).json({ user: req.user });
});

app.use("/", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "./views", "error.html"));
});

const server = http.createServer(app);

socketIO(server);

sequelize.sync().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`connection eshtablished successfully ${process.env.URL}`);
  });
});
