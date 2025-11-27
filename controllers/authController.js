//core modules
const path = require("path");

//third-party modules
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//local modules
const User = require("../models/user");

exports.homePage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "home.html"));
};

exports.signupPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "sign-up.html"));
};

exports.loginPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "login.html"));
};

exports.addUser = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (
      name.length === 0 ||
      email.length === 0 ||
      phone.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please enter valid email id" });
    }

    if (!validator.isMobilePhone(phone, "any")) {
      return res
        .status(400)
        .json({ message: "Please enter valid Phone Number" });
    }

    const userExist1 = await User.findOne({
      where: {
        email,
      },
    });

    const userExist2 = await User.findOne({
      where: {
        phone,
      },
    });

    if (userExist1 || userExist2) {
      return res.status(400).json({ message: "Email/Phone already exists" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      friends: JSON.stringify([]),
      groups: JSON.stringify([]),
    });

    if (!createUser) {
      return res
        .status(400)
        .json({ message: "User cannot be created at the moment" });
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email_phone, password } = req.body;

    let user;

    if (validator.isEmail(email_phone)) {
      user = await User.findOne({
        where: {
          email: email_phone,
        },
      });
    } else if (validator.isMobilePhone(email_phone, "any")) {
      user = await User.findOne({
        where: {
          phone: email_phone,
        },
      });
    } else {
      return res
        .status(403)
        .json({ message: "Entered email/phone is not valid" });
    }

    if (password.length === 0) {
      return res.status(400).json({ message: "Password cannot be empty!!!" });
    }

    if (!user) {
      return res.status(400).json({ message: "User not found!!!" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(403).json({ message: "incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET_KEY
    );

    if (!token) {
      return res.status(400).json({ message: "Token missing" });
    }

    res.status(200).json({ message: "login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
