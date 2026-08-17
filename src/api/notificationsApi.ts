import { apiClient } from './apiClient';
import type { Notification } from '../types';

export const notificationsApi = {
  getNotifications: async (userId?: string): Promise<Notification[]> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiClient.get<Notification[]>(`/notifications${query}`);
  },

  markAsRead: async (id: string): Promise<boolean> => {
    try {
      await apiClient.patch<{ id: string; read: boolean }>(
        `/notifications/${encodeURIComponent(id)}/read`,
        {}
      );
      return true;
    } catch {
      return false;
    }
  },

  markAllAsRead: async (): Promise<boolean> => {
    try {
      await apiClient.patch<{ userId: string }>('/notifications/read-all', {});
      return true;
    } catch {
      return false;
    }
  },
};
