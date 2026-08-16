import type { Notification } from '../types/index.js';
import {
  getNotificationRepository,
} from '../repositories/index.js';
import type {
  CreateNotificationDto,
} from '../repositories/index.js';

export class NotificationService {
  public async getAll(userId?: string): Promise<Notification[]> {
    const repo = getNotificationRepository();
    return repo.getAll(userId);
  }

  public async createNotification(
    data: CreateNotificationDto
  ): Promise<Notification> {
    const repo = getNotificationRepository();
    return repo.create(data);
  }

  public async markAsRead(id: string): Promise<boolean> {
    const repo = getNotificationRepository();
    return repo.markAsRead(id);
  }
}

export const notificationService = new NotificationService();
