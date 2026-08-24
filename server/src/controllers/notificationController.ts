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
    const user = req.user;
    if (!user) {
      throw new AppError('Authentication required.', 401);
    }

    // Strictly scope notifications to complaints owned by the authenticated student
    const notifications = await notificationService.getAll(user);

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

    const user = req.user;
    if (!user) throw new AppError('Authentication required.', 401);

    const result = await notificationService.markAsRead(id, user);

    if (result.notFound) {
      throw new AppError(`Notification with ID '${id}' was not found.`, 404);
    }

    if (result.unauthorized) {
      throw new AppError('Access denied: You can only update your own notifications.', 403);
    }

    if (!result.success) {
      throw new AppError(`Failed to update notification '${id}'.`, 500);
    }

    const response: ApiResponse<{ id: string; read: boolean }> = {
      success: true,
      message: `Notification ${id} marked as read.`,
      data: { id, read: true },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
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
    const user = req.user;
    if (!user) throw new AppError('Authentication required.', 401);

    const ok = await notificationService.markAllAsRead(user);

    const response: ApiResponse<{ userId: string }> = {
      success: ok,
      message: ok
        ? 'All notifications marked as read.'
        : 'Some notifications could not be updated.',
      data: { userId: user.id },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
