//core modules
const path = require("path");

//third-party modules
const express = require("express");
const cors = require("cors");
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

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(
      `connection eshtablished successfully http://localhost:4000/sign-up`
    );
  });
});
