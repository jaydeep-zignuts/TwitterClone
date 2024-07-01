import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found",
        err: err,
      });
    }
    return res.status(200).json({
      status: 200,
      message: "user profile retrived",
      data: user,
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
export const followUnfollowUser = async (req, res) => {
  try {
    const id = req.params.id;
    const userTomodify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString()) {
      return res.status(404).json({
        status: 404,
        message: "you can't follow/unfollow your self",
        err: {},
      });
    }
    if (!userTomodify || !currentUser) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found",
        err: err,
      });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      //unfollow
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      return res
        .status(200)
        .json({ status: 200, message: "unfollowed successdully", data: {} });
    } else {
      //follow
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const notification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userTomodify._id,
      });
      await notification.save();
      return res
        .status(200)
        .json({ status: 200, message: "following successdully", data: {} });
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

export const getSuggestedUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filterUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    let suggestedUsers = filterUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    return res.status(200).json({
      status: 200,
      message: "suggested user retrived",
      data: suggestedUsers,
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
export const updateUser = async (req, res) => {
  try {
    let { fullName, email, username, currentPassword, newPassword, bio, link } =
      req.body;
    let { profileImg, coverImg } = req.body;
    const userId = req.user._id;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: "User Not Found",
        err: err,
      });
    }
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        status: 400,
        message: "please provide both current password and new password",
        err: err,
      });
    }
    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          status: 400,
          message: "current password is incorrect",
          err: {},
        });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          status: 400,
          message: "Password ust be at least 6 character long",
          err: {},
        });
      }
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();
    user.password = null;
    return res.status(200).json({
      status: 200,
      message: "user data updated",
      data: user,
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
