import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectedRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized: token not provided",
        err: err,
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({
        status: 401,
        message: "Unauthorized : invalid token",
        err: err,
      });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        err: {},
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal Server Error", err: err });
  }
};
