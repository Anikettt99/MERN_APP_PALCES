const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Getting Users Failed, please try again", 500);
    return next(error);
  }

  if (!users) {
    return res.json("NO USERS FOUND");
  }

  res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  //console.log("asdf");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError("INVALID INPUT", 422);
    return next(error);
  }
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }
  let hashedPassword;
  try {
    
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "Could not create user , please try again",
      500
    );
    return next(error);
  }

  console.log(req.file.path);
  const createdUser = new User({
    name,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      "Signing Up failed , please try again later",
      422
    );
    return next(error);
  }

  let token;
  token = jwt.sign(
    { userId: createdUser.id, email: createdUser.email },
    process.env.JWT_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.status(201).json({
    userId: createdUser.id,
    email: createdUser.email,
    token: token,
    message: "SIGNED UP",
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again", 500);
    return next(error);
  }

  if (!existingUser) {
    return next(new HttpError("NO USER FOUND OR WRONG PASSWORD", 401));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError("Could Not Login Please tyr again", 500);
    return next(error);
  }

  if (!isValidPassword) {
    return next(new HttpError("NO USER FOUND OR WRONG PASSWORD", 401));
  }

  let token;
  token = jwt.sign(
    { userId: existingUser.id, email: existingUser.email },
    process.env.JWT_KEY,
    {
      expiresIn: "1h",
    }
  );

  res.status(201).json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    message: "SIGNED UP",
  });
}; 

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
