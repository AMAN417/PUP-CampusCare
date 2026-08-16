import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService.js';
import { ApiResponse, Notification } from '../types/index.js';

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.query.userId as string | undefined;
    const notifications = await notificationService.getAll(userId);

    const response: ApiResponse<Notification[]> = {
      success: true,
      message: `Retrieved ${notifications.length} notification(s).`,
      data: notifications,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
