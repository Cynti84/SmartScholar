import { Request, Response } from "express";
import { AppDataSource } from "../utils/db";
import { Notification } from "../models/notifications";

export class AdminNotificationController {
  // Get all notifications for admin dashboard
  static async getNotifications(req: Request, res: Response) {
    try {
      const notificationRepo = AppDataSource.getRepository(Notification);

      const notifications = await notificationRepo.find({
        order: { createdAt: "DESC" },
        take: 20, // limit to recent 20
      });

      return res.json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  }

  // Optional: Create notification
  static async createNotification(req: Request, res: Response) {
    try {
      const { type, message, priority } = req.body;
      const notificationRepo = AppDataSource.getRepository(Notification);

      const newNotification = notificationRepo.create({
        type,
        message,
        priority,
      });

      await notificationRepo.save(newNotification);

      return res.status(201).json({
        success: true,
        data: newNotification,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to create notification",
      });
    }
  }
}
