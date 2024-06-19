import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import connectMongoDB from "./dbConfig/connectMongoDB.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 50001;
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Server is ready");
});
app.listen(PORT, () => {
  console.log(`server is runnning on port ${PORT}`);
  connectMongoDB();
});
