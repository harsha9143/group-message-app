//core modules
const http = require("http");
const path = require("path");

//third-party modules
const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
require("dotenv").config();

//local modules
const authRouter = require("./routes/authRouter");
const sequelize = require("./utils/dbUtil");
const User = require("./models/user");
const userRouter = require("./routes/userRouter");
const Message = require("./models/message");
const { authenticate } = require("./middleware/authenticationToken");

User.hasMany(Message);
Message.belongsTo(User);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRouter);
app.use("/user", userRouter);
app.get("/verify-token", authenticate, (req, res) => {
  res.json({ user: req.user });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4000",
  },
});

//const wss = new WebSocket.Server({ server });

//let sockets = [];

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Token is missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return next(new Error("Token expired"));
    }

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;
    next();
  } catch (error) {
    return next(new Error("Internal server error"));
  }
});

io.on("connection", (socket) => {
  socket.on("message-room", async (message) => {
    console.log(socket.user);
    await Message.create({ message, userId: socket.user.id });
    io.emit("message-room", {
      message,
      username: socket.user.name,
      createdAt: new Date(),
    });
  });
});

sequelize.sync().then(() => {
  // app.listen(process.env.PORT, () => {
  //   console.log(
  //     `connection eshtablished successfully http://localhost:4000/login`
  //   );
  // });

  server.listen(4000, () => console.log("web socket server on port 4003"));
});
