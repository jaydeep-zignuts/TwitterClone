import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json({
      status: 200,
      message: "notification retrived",
      data: notifications,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      err: err,
    });
  }
};
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.deleteMany({ to: userId });
    res.status(200).json({
      status: 200,
      message: "notification deleted successfully",
      data: notifications,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      err: err,
    });
  }
};
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      res.status(404).json({
        status: 404,
        message: "notification not found",
        err: {},
      });
    }
    if (notification.to.toString() !== userId.toString()) {
      res.status(403).json({
        status: 403,
        message: "you are not allowed to delete this notification",
        err: {},
      });
    }
    const deletedNotification = await Notification.findByIdAndDelete(
      req.params.id
    );
    res.status(200).json({
      status: 200,
      message: "Notificaton deleted successfully",
      data: deletedNotification,
    });
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal Server Error",
      err: err,
    });
  }
};
