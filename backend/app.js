import express from "express";

import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
dotenv.config();

import connectMongoDB from "./dbConfig/connectMongoDB.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5001;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Server is ready");
});
app.listen(PORT, () => {
  connectMongoDB();
  console.log(`server is runnning on port ${PORT}`);
});
