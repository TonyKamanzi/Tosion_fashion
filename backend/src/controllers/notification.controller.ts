import type { Request, Response } from "express";
import Notification from "../models/notification.model.js";

// GET /notifications — all notifications (admin), newest first
export const getNotifications = async (_req: Request, res: Response) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await Notification.countDocuments({ read: false });

    res.status(200).json({ items: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error });
  }
};

// PUT /notifications/read — mark all as read
export const markAllRead = async (_req: Request, res: Response) => {
  try {
    await Notification.updateMany({ read: false }, { $set: { read: true } });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications", error });
  }
};

// PUT /notifications/:id/read — mark single as read
export const markOneRead = async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { $set: { read: true } });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notification", error });
  }
};

// helper — called from order controller
export async function createNotification(data: {
  type: "new_order" | "order_status" | "low_stock" | "review" | "system";
  title: string;
  message: string;
  href?: string;
}) {
  try {
    await Notification.create(data);
  } catch {
    // non-critical, swallow
  }
}
