//core modules
const path = require("path");

//third-party modules
const express = require("express");
require("dotenv").config();

//local modules
const authRouter = require("./routes/authRouter");
const sequelize = require("./utils/dbUtil");
const User = require("./models/user");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRouter);

sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(
      `connection eshtablished successfully http://localhost:4000/sign-up`
    );
  });
});
