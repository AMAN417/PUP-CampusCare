import { apiClient } from './apiClient';
import type { Notification } from '../types';

export const notificationsApi = {
  getNotifications: async (userId?: string): Promise<Notification[]> => {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return apiClient.get<Notification[]>(`/notifications${query}`);
  },
};
