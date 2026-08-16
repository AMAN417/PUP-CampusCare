import {
  INotificationRepository,
  CreateNotificationDto,
} from '../interfaces.js';
import { Notification } from '../../types/index.js';
import { INITIAL_NOTIFICATIONS } from '../../data/initialData.js';

export class MemoryNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

  public async getAll(userId?: string): Promise<Notification[]> {
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

  public async create(data: CreateNotificationDto): Promise<Notification> {
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
    return JSON.parse(JSON.stringify(newNotif));
  }

  public async markAsRead(id: string): Promise<boolean> {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.read = true;
    return true;
  }
}
