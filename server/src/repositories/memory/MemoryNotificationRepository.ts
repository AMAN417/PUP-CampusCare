import {
  INotificationRepository,
  CreateNotificationDto,
} from '../interfaces.js';
import { Notification, User } from '../../types/index.js';
import { INITIAL_NOTIFICATIONS } from '../../data/initialData.js';
import { getComplaintRepository } from '../index.js';
import { isStudentComplaintOwner } from '../../utils/ownership.js';

export class MemoryNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));

  public async getById(id: string): Promise<Notification | null> {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return null;
    return JSON.parse(JSON.stringify(notif));
  }

  public async getAll(userOrId?: User | string): Promise<Notification[]> {
    if (!userOrId || userOrId === 'all') {
      return [...this.notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    if (typeof userOrId === 'object' && userOrId !== null) {
      if (userOrId.role === 'admin') {
        return [...this.notifications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      // For students: strictly return ONLY notifications associated with their own complaints
      if (userOrId.role === 'student') {
        const complaintRepo = getComplaintRepository();
        const allComplaints = await complaintRepo.getAll();
        const ownedComplaints = allComplaints.filter((c) =>
          isStudentComplaintOwner(c, userOrId)
        );

        if (ownedComplaints.length === 0) {
          return [];
        }

        const ownedComplaintIds = new Set(
          ownedComplaints.map((c) => c.id.trim().toUpperCase())
        );

        return this.notifications
          .filter(
            (n) =>
              Boolean(n.complaintId) &&
              ownedComplaintIds.has(String(n.complaintId).trim().toUpperCase())
          )
          .sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    }

    // If string userId is passed
    const complaintRepo = getComplaintRepository();
    const allComplaints = await complaintRepo.getAll();
    const ownedComplaints = allComplaints.filter(
      (c) =>
        c.studentId === userOrId ||
        (userOrId === 'user-student-1' && c.studentId === 'user-student-1')
    );

    if (ownedComplaints.length === 0) {
      return [];
    }

    const ownedComplaintIds = new Set(
      ownedComplaints.map((c) => c.id.trim().toUpperCase())
    );

    return this.notifications
      .filter(
        (n) =>
          Boolean(n.complaintId) &&
          ownedComplaintIds.has(String(n.complaintId).trim().toUpperCase())
      )
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

  public async deleteByComplaint(complaintIds: string[]): Promise<boolean> {
    const identifiers = new Set(
      (complaintIds || [])
        .filter((id) => typeof id === 'string' && id.trim().length > 0)
        .map((id) => id.trim().toUpperCase())
    );

    if (identifiers.size === 0) return true;

    // Keep broadcast/general notifications; remove only those tied to the
    // deleted complaint (matching any of the provided identifier forms).
    this.notifications = this.notifications.filter(
      (n) =>
        !n.complaintId ||
        !identifiers.has(String(n.complaintId).trim().toUpperCase())
    );
    return true;
  }
}
