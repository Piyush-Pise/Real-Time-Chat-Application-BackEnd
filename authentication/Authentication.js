require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { AuthDB, UserDB } = require("../database/models");
const AuthorizationMiddleware = require("../middleware/Authorization");
const router = express.Router();

router.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;
  console.log("Signup Request", email);

  try {
    let user = await AuthDB.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new AuthDB({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    user = await AuthDB.findOne({ email });

    let userData = new UserDB({
      _id: user._id,
      UserName: user.name,
      roomIds: [],
    });

    await userData.save();
    
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.post("/log-in", async (req, res) => {
  const { email, password } = req.body;
  console.log("Request to login", email);
  try {
    let user = await AuthDB.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

router.get("/verify-token", AuthorizationMiddleware, async (req, res) => {

  // let userData = await AuthDB.findById(req.user.id);
  // console.log("verify-token request from user", user);
  res.sendStatus(200);
});

module.exports = router;
