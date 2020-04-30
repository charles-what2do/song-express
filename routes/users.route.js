const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { createJWTToken } = require("../utils/jwt");
const { protectRoute } = require("../middleware/auth");

router.post(
  "/",
  wrapAsync(async (req, res) => {
    const submittedUser = req.body;
    const user = new User(submittedUser);
    const newUser = await user.save();
    res.send(newUser);
  })
);

router.post("/logout", (req, res) => {
  res.clearCookie("token").send("You have been logged out");
});

const respondLoggedIn = (req, res) => {
  res.send("You are logged in");
};

const setToken = async (req, res, next) => {
  const loginDetails = req.body;
  const { username, password } = loginDetails;
  const foundUser = await User.findOne({ username: username });

  if (!foundUser) {
    const noUserError = new Error("No such user");
    noUserError.statusCode = 404;
    throw noUserError;
  }

  const result = await bcrypt.compare(password, foundUser.password);
  if (!result) {
    const wrongPasswordError = new Error("Wrong password");
    wrongPasswordError.statusCode = 400;
    throw wrongPasswordError;
  }

  req.token = createJWTToken(username);
  next();
};

const setCookie = (req, res, next) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = oneDay * 7;
  const expiryDate = new Date(Date.now() + oneWeek);

  const cookieName = "token";
  const token = req.token;

  if (
    process.env.NODE_ENV === "development" ||
    process.env.NODE_ENV === "test"
  ) {
    res.cookie(cookieName, token, {
      expires: expiryDate,
      httpOnly: true,
      signed: true,
    });
  } else {
    res.cookie(cookieName, token, {
      expires: expiryDate,
      httpOnly: true, // client-side js cannot access cookie info
      secure: true, //use HTTPS
      signed: true,
    });
  }
  next();
};

router.post("/login", wrapAsync(setToken), setCookie, respondLoggedIn);

router.get(
  "/:username",
  protectRoute,
  wrapAsync(async (req, res) => {
    const usernameToFind = req.params.username;
    const user = await User.findOne({ username: usernameToFind });
    if (!user) {
      const noUserError = new Error("No such user");
      noUserError.statusCode = 404;
      throw noUserError;
    }
    if (req.user.username != usernameToFind) {
      const userNotAllowedError = new Error("Forbidden");
      userNotAllowedError.statusCode = 403;
      throw userNotAllowedError;
    }

    const userObject = user.toObject();
    const { _id, __v, password, ...strippedUser } = userObject;
    res.json(strippedUser);
  })
);

module.exports = router;
