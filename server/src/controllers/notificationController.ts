import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../services/notificationService.js';
import { ApiResponse, Notification } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Strictly scope notifications to the authenticated user's ID
    const userId = req.user?.id;
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

export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || '');
    if (!id) throw new AppError('Notification ID is required.', 400);

    const ok = await notificationService.markAsRead(id);

    const response: ApiResponse<{ id: string; read: boolean }> = {
      success: ok,
      message: ok
        ? `Notification ${id} marked as read.`
        : `Notification ${id} not found or already read.`,
      data: { id, read: true },
      timestamp: new Date().toISOString(),
    };

    res.status(ok ? 200 : 404).json(response);
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('Authentication required.', 401);

    const ok = await notificationService.markAllAsRead(userId);

    const response: ApiResponse<{ userId: string }> = {
      success: ok,
      message: ok
        ? 'All notifications marked as read.'
        : 'Some notifications could not be updated.',
      data: { userId },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
