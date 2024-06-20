import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  likeUnlikePost,
  getAllPost,
  getLikedPost,
  getFollowingPosts,
  getUserPosts,
} from "../controllers/post.controller.js";
const router = express.Router();

router.get("/all", protectedRoute, getAllPost);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/likes/:id", protectedRoute, getLikedPost);
router.get("/user/:username", protectedRoute, getUserPosts);
router.post("/create", protectedRoute, createPost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.delete("/:id", protectedRoute, deletePost);
export default router;
