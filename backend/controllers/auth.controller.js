import { generateTokenAndSerCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import * as bcrypt from "bcrypt";
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    console.log(req.body);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid Email", err: {} });
    }
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: 400, message: "Username already exists", err: {} });
    }
    const existingEmail = await User.findOne({ email: email });

    if (existingEmail) {
      return res
        .status(400)
        .json({ status: 400, message: "Email  already exists", err: {} });
    }
    if (password.length < 6) {
      return res.status(400).json({
        status: 400,
        message: "Password ust be at least 6 character long",
        err: {},
      });
    }
    const salt = await bcrypt.genSalt();
    console.log("salt,", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      fullName: fullName,
      username: username,
      email: email,
      password: hashedPassword,
    });
    await user.save();
    const userData = await user.toObject();

    if (user) {
      generateTokenAndSerCookie(user._id, res);
      delete userData.password;
      return res.status(201).json({
        status: 201,
        message: "User Created",
        data: userData,
      });
    } else {
      return res
        .status(400)
        .json({ status: 400, message: "Invalid User Data", err: {} });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", err: err });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res
        .status(400)
        .json({ status: 400, message: "User not Exists", err: {} });
    }
    const decoded = await bcrypt.compare(password, user.password);

    if (!decoded) {
      return res.status(400).json({
        status: 400,
        message: "Inavalid username or password",
        err: {},
      });
    }
    generateTokenAndSerCookie(user._id, res);
    const userData = user.toObject();
    delete userData.password;
    return res.status(200).json({
      status: 200,
      message: "login successfully",
      data: userData,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", err: err });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    return res.status(200).json({
      status: 200,
      message: "Logged out succesfullt",
      data: userData,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", err: err });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({
      status: 200,
      message: "Logged out succesfullt",
      data: user,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", err: err });
  }
};
