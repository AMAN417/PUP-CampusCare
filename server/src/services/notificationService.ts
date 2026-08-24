import type { Notification, User } from '../types/index.js';
import {
  getNotificationRepository,
  getComplaintRepository,
} from '../repositories/index.js';
import type {
  CreateNotificationDto,
} from '../repositories/index.js';
import { isStudentComplaintOwner } from '../utils/ownership.js';

export interface MarkReadResult {
  success: boolean;
  notFound?: boolean;
  unauthorized?: boolean;
}

export class NotificationService {
  public async getAll(userOrId?: User | string): Promise<Notification[]> {
    const repo = getNotificationRepository();
    return repo.getAll(userOrId);
  }

  public async getById(id: string): Promise<Notification | null> {
    const repo = getNotificationRepository();
    return repo.getById(id);
  }

  public async createNotification(
    data: CreateNotificationDto
  ): Promise<Notification> {
    const repo = getNotificationRepository();
    return repo.create(data);
  }

  public async markAsRead(id: string, user?: User): Promise<MarkReadResult> {
    const repo = getNotificationRepository();
    const notification = await repo.getById(id);

    if (!notification) {
      return { success: false, notFound: true };
    }

    if (user && user.role === 'student') {
      if (!notification.complaintId) {
        return { success: false, unauthorized: true };
      }

      const complaintRepo = getComplaintRepository();
      const complaint = await complaintRepo.getById(notification.complaintId);

      if (!complaint || !isStudentComplaintOwner(complaint, user)) {
        return { success: false, unauthorized: true };
      }
    }

    const ok = await repo.markAsRead(id);
    return { success: ok };
  }

  public async markAllAsRead(userOrId: User | string): Promise<boolean> {
    const repo = getNotificationRepository();
    const notifications = await this.getAll(userOrId);
    const unread = notifications.filter((n) => !n.read);
    let allOk = true;
    for (const n of unread) {
      const ok = await repo.markAsRead(n.id);
      if (!ok) allOk = false;
    }
    return allOk;
  }
}

export const notificationService = new NotificationService();
