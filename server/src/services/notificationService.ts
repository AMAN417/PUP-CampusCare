import { Notification } from '../types/index.js';
import { INITIAL_NOTIFICATIONS } from '../data/initialData.js';

export class NotificationService {
  private notifications: Notification[] = [...INITIAL_NOTIFICATIONS];

  public getAll(userId?: string): Notification[] {
    if (!userId || userId === 'all') {
      return [...this.notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return this.notifications
      .filter((n) => n.userId === 'all' || n.userId === userId)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  public createNotification(data: {
    userId: string;
    title: string;
    message: string;
    type: 'status_change' | 'assignment' | 'comment' | 'urgent' | 'general';
    complaintId?: string;
  }): Notification {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      complaintId: data.complaintId,
      read: false,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotif);
    return newNotif;
  }
}

export const notificationService = new NotificationService();
