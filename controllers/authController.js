const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signupPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "signup.html"));
};

exports.loginPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../views", "login.html"));
};

exports.signupUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    if (!user) {
      return res.status(403).json({ message: "Failed to create user" });
    }

    res.status(201).json({ message: "User account created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error!! user creation failed" });
  }
};

exports.loginUser = async (req, res) => {
  const { emailPhone, password } = req.body;
  try {
    if (!emailPhone) {
      return res
        .status(400)
        .json({ message: "Email or Phone cannot be empty" });
    }

    if (!password) {
      return res.status(400).json({ message: "Please enter your password" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    let user;

    if (emailRegex.test(emailPhone)) {
      user = await User.findOne({
        where: {
          email: emailPhone,
        },
      });
    } else if (phoneRegex.test(emailPhone)) {
      user = await User.findOne({
        where: {
          phone: emailPhone,
        },
      });
    } else {
      return res
        .status(404)
        .json({ message: "Please enter valid email or phone" });
    }

    if (!user) {
      return res.status(404).json({ message: "Email/Phone does not exist" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(403).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.log("Failed to login>>>>>>", error.message);
    res.status(500).json({ message: "Server error!! failed to login" });
  }
};
