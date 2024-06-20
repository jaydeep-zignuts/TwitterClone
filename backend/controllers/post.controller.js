import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found",
        err: {},
      });
    }
    if (!text && !img) {
      return res.status(400).json({
        status: 400,
        message: "Post must have text or image",
        err: {},
      });
    }
    if (img) {
      const uploadedResponse = cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const post = new Post({
      user: userId,
      text,
      img,
    });
    await post.save();
    return res.status(201).json({
      status: 201,
      message: "posted uploaded",
      data: post,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};
export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post Not Found",
        data: post,
      });
    }
    const userLikePost = post.likes.includes(userId);
    if (userLikePost) {
      //unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      return res.status(200).json({
        status: 200,
        message: "Post unliked successfuly",
        data: {},
      });
    } else {
      //like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();
      return res.status(200).json({
        status: 200,
        message: "Post liked successfuly",
        post: post,
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};
export const commentOnPost = async (req, res) => {
  try {
    const text = req.body.text;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({
        status: 400,
        message: "text required for comment",
        err: {},
      });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post Not Found",
        err: {},
      });
    }
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(201).json({
      status: 201,
      message: "Comment posted",
      data: post,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        status: 404,
        message: "Post Not Found",
        err: {},
      });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 403,
        message: "you are not authorized to delete this post",
        err: {},
      });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: 200,
      message: "Post deleted",
      data: post,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};
export const getAllPost = async (req, res) => {
  try {
    let posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    if (posts.length <= 0) {
      return res.status(200).json({
        status: 200,
        message: "posts retrived",
        data: [],
      });
    }
    return res.status(200).json({
      status: 200,
      message: "posts retrived",
      data: posts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};

export const getLikedPost = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found",
        err: {},
      });
    }
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    return res.status(200).json({
      status: 200,
      message: "Liked posts retrived",
      data: likedPosts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};
export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found",
        err: {},
      });
    }
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({
        createdAt: -1,
      })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json({
      status: 200,
      message: "feed posts retrived",
      data: feedPosts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};
export const getUserPosts = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found",
        err: {},
      });
    }
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json({
      status: 200,
      message: "user posts retrived",
      err: posts,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Intrnal Server Error",
      err: err,
    });
  }
};
