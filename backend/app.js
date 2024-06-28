import express from "express";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
dotenv.config();
import connectMongoDB from "./dbConfig/connectMongoDB.js";
import cookieParser from "cookie-parser";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});
const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
// app.get("/", (req, res) => {
//   res.send("Server is ready");
// });
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
app.listen(PORT, () => {
  connectMongoDB();
  console.log(`server is runnning on port ${PORT}`);
});
