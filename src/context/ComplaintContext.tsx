import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import type {
  Complaint,
  ComplaintStatus,
  Priority,
  Notification,
  UserRole,
} from '../types';
import { storage } from '../utils/storage';
import { complaintsApi } from '../api/complaintsApi';
import { notificationsApi } from '../api/notificationsApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface ComplaintContextType {
  complaints: Complaint[];
  notifications: Notification[];
  unreadNotificationCount: number;
  loading: boolean;
  isApiMode: boolean;
  providerError: string | null;
  refreshComplaints: () => Promise<void>;
  getComplaintById: (id: string) => Complaint | undefined;
  fetchComplaintById: (id: string) => Promise<Complaint | undefined>;
  createComplaint: (data: {
    title: string;
    description: string;
    category: any;
    location: string;
    priority: Priority;
    attachments?: any[];
  }) => Promise<Complaint>;
  editComplaint: (
    complaintId: string,
    updates: {
      title?: string;
      description?: string;
      category?: any;
      priority?: Priority;
      location?: string;
    }
  ) => Promise<Complaint | null>;
  deleteComplaint: (complaintId: string) => Promise<boolean>;
  updateStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    notes?: string,
    department?: string
  ) => Promise<boolean>;
  assignOfficer: (
    complaintId: string,
    department: string,
    officer: string
  ) => Promise<boolean>;
  addComment: (
    complaintId: string,
    message: string,
    isInternal?: boolean
  ) => Promise<boolean>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  exportCSV: (filteredList?: Complaint[]) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

const DATA_PROVIDER_MODE = (
  import.meta.env.VITE_DATA_PROVIDER || 'api'
).toLowerCase();

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();

  const isApiMode = DATA_PROVIDER_MODE !== 'local';
  const [complaints, setComplaints] = useState<Complaint[]>(() =>
    isApiMode ? [] : storage.getComplaints()
  );
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    isApiMode ? [] : storage.getNotifications()
  );
  const [loading, setLoading] = useState<boolean>(isApiMode);
  const [providerError, setProviderError] = useState<string | null>(null);

  const isInitialMount = useRef(true);

  // Refresh complaints and notifications from API or LocalStorage
  const refreshComplaints = useCallback(async (): Promise<void> => {
    if (!isApiMode) {
      setComplaints(storage.getComplaints());
      setNotifications(storage.getNotifications());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setProviderError(null);

      const [apiComplaints, apiNotifs] = await Promise.all([
        complaintsApi.getComplaints(),
        notificationsApi.getNotifications(user?.id),
      ]);

      setComplaints(apiComplaints);
      setNotifications(apiNotifs);
    } catch (err: any) {
      console.warn('CampusCare API unavailable, falling back to local cache:', err);
      setProviderError(err?.message || 'API unavailable');

      // Fallback to local storage
      const localComplaints = storage.getComplaints();
      const localNotifs = storage.getNotifications(user?.id);
      setComplaints(localComplaints);
      setNotifications(localNotifs);

      if (isInitialMount.current) {
        info(
          'Connecting to local fallback storage',
          'CampusCare REST API is running in fallback mode.'
        );
      }
    } finally {
      setLoading(false);
      isInitialMount.current = false;
    }
  }, [isApiMode, user?.id, info]);

  // Initial load
  useEffect(() => {
    refreshComplaints();
  }, [refreshComplaints]);

  // Listen for storage events (multi-tab support in local mode)
  useEffect(() => {
    if (!isApiMode) {
      const handleStorageChange = () => {
        refreshComplaints();
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, [isApiMode, refreshComplaints]);

  const getComplaintById = useCallback(
    (id: string): Complaint | undefined => {
      const cleanId = id.trim().toLowerCase();
      return complaints.find((c) => c.id.toLowerCase() === cleanId);
    },
    [complaints]
  );

  const fetchComplaintById = useCallback(
    async (id: string): Promise<Complaint | undefined> => {
      if (!isApiMode) {
        return storage.getComplaintById(id);
      }

      try {
        const fetched = await complaintsApi.getComplaintById(id);
        if (fetched) {
          // Update local state cache
          setComplaints((prev) => {
            const index = prev.findIndex(
              (c) => c.id.toLowerCase() === id.toLowerCase()
            );
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = fetched;
              return updated;
            }
            return [fetched, ...prev];
          });
        }
        return fetched;
      } catch (err) {
        console.warn(`Failed to fetch complaint #${id} from API, using cached:`, err);
        return getComplaintById(id);
      }
    },
    [isApiMode, getComplaintById]
  );

  const createComplaint = async (data: {
    title: string;
    description: string;
    category: any;
    location: string;
    priority: Priority;
    attachments?: any[];
  }): Promise<Complaint> => {
    const studentName = user?.name || 'Harmanpreet Singh';
    const studentId = user?.id || 'user-student-1';
    const studentRollNo = user?.rollNo || 'PUP2024-CS-042';
    const studentDepartment =
      user?.department || 'Department of Computer Science & Engineering';

    if (isApiMode) {
      try {
        const newComplaint = await complaintsApi.createComplaint({
          title: data.title.trim(),
          description: data.description.trim(),
          category: data.category,
          location: data.location.trim(),
          priority: data.priority,
          attachments: data.attachments || [],
          studentId,
          studentName,
          studentRollNo,
          studentDepartment,
        });

        // Update state in memory
        setComplaints((prev) => [newComplaint, ...prev]);

        // Refresh notifications
        try {
          const freshNotifs = await notificationsApi.getNotifications(user?.id);
          setNotifications(freshNotifs);
        } catch {
          // Ignore notification refresh error
        }

        success(
          'Complaint Submitted Successfully!',
          `Reference ID: ${newComplaint.id}`
        );
        return newComplaint;
      } catch (err: any) {
        console.error('API submit complaint failed, trying fallback:', err);
        toastError('Failed to submit complaint via API', err?.message || 'Error');
        throw err;
      }
    } else {
      // Local mode
      try {
        const newComplaint = storage.saveComplaint({
          title: data.title,
          description: data.description,
          category: data.category,
          location: data.location,
          priority: data.priority,
          attachments: data.attachments || [],
          studentId,
          studentName,
          studentRollNo,
          studentDepartment,
        });

        refreshComplaints();
        success(
          'Complaint Submitted Successfully!',
          `Reference ID: ${newComplaint.id}`
        );
        return newComplaint;
      } catch (err) {
        toastError('Failed to submit complaint', 'Please check required fields.');
        throw err;
      }
    }
  };

  const updateStatus = async (
    complaintId: string,
    newStatus: ComplaintStatus,
    notes?: string,
    department?: string
  ): Promise<boolean> => {
    const adminUser = {
      name: user?.name || 'Campus Administrator',
      role: (user?.role || 'admin') as UserRole,
    };

    if (isApiMode) {
      try {
        const updated = await complaintsApi.updateStatus(complaintId, {
          status: newStatus,
          notes,
          department,
          updatedBy: adminUser.name,
          role: adminUser.role,
        });

        if (updated) {
          setComplaints((prev) =>
            prev.map((c) =>
              c.id.toLowerCase() === complaintId.toLowerCase() ? updated : c
            )
          );

          // Refresh notifications
          try {
            const freshNotifs = await notificationsApi.getNotifications(user?.id);
            setNotifications(freshNotifs);
          } catch {
            // Ignore
          }

          success(
            'Status Updated',
            `Complaint ${complaintId} is now ${newStatus}`
          );
          return true;
        }
        return false;
      } catch (err: any) {
        toastError('Error updating status', err?.message || 'Failed to update status');
        return false;
      }
    } else {
      try {
        const updated = storage.updateComplaintStatus(
          complaintId,
          newStatus,
          adminUser,
          notes,
          department
        );

        if (updated) {
          refreshComplaints();
          success(
            'Status Updated',
            `Complaint ${complaintId} is now ${newStatus}`
          );
          return true;
        }
        return false;
      } catch {
        toastError('Error updating status');
        return false;
      }
    }
  };

  const assignOfficer = async (
    complaintId: string,
    department: string,
    officer: string
  ): Promise<boolean> => {
    const adminUser = {
      name: user?.name || 'Campus Administrator',
      role: (user?.role || 'admin') as UserRole,
    };

    if (isApiMode) {
      try {
        const updated = await complaintsApi.patchComplaint(complaintId, {
          assignedDepartment: department,
          assignedTo: officer,
        });

        if (updated) {
          setComplaints((prev) =>
            prev.map((c) =>
              c.id.toLowerCase() === complaintId.toLowerCase() ? updated : c
            )
          );

          // Refresh notifications
          try {
            const freshNotifs = await notificationsApi.getNotifications(user?.id);
            setNotifications(freshNotifs);
          } catch {
            // Ignore
          }

          success(
            'Officer Assigned',
            `${officer} (${department}) assigned to ${complaintId}`
          );
          return true;
        }
        return false;
      } catch (err: any) {
        toastError('Error assigning officer', err?.message || 'Failed');
        return false;
      }
    } else {
      try {
        const updated = storage.assignComplaint(
          complaintId,
          department,
          officer,
          adminUser
        );
        if (updated) {
          refreshComplaints();
          success(
            'Officer Assigned',
            `${officer} (${department}) assigned to ${complaintId}`
          );
          return true;
        }
        return false;
      } catch {
        toastError('Error assigning officer');
        return false;
      }
    }
  };

  const addComment = async (
    complaintId: string,
    message: string,
    isInternal: boolean = false
  ): Promise<boolean> => {
    if (!user) return false;

    if (isApiMode) {
      try {
        const result = await complaintsApi.addComment(complaintId, {
          message: message.trim(),
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          isInternal,
          avatar: user.avatar,
        });

        if (result?.complaint) {
          setComplaints((prev) =>
            prev.map((c) =>
              c.id.toLowerCase() === complaintId.toLowerCase()
                ? result.complaint
                : c
            )
          );

          // Refresh notifications
          try {
            const freshNotifs = await notificationsApi.getNotifications(user?.id);
            setNotifications(freshNotifs);
          } catch {
            // Ignore
          }

          success('Comment Posted');
          return true;
        }
        return false;
      } catch (err: any) {
        toastError('Failed to post comment', err?.message || 'Error');
        return false;
      }
    } else {
      try {
        const comment = storage.addComment(
          complaintId,
          user,
          message,
          isInternal
        );
        if (comment) {
          refreshComplaints();
          success('Comment Posted');
          return true;
        }
        return false;
      } catch {
        toastError('Failed to post comment');
        return false;
      }
    }
  };

  const markNotificationRead = (id: string) => {
    // Optimistic UI update first
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (isApiMode) {
      // Fire-and-forget: persist read state server-side
      notificationsApi.markAsRead(id).catch((err) => {
        console.warn(`Failed to mark notification ${id} as read via API:`, err);
      });
    } else {
      storage.markNotificationAsRead(id);
    }
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isApiMode) {
      // Fire-and-forget: persist read-all state server-side
      notificationsApi.markAllAsRead().catch((err) => {
        console.warn('Failed to mark all notifications as read via API:', err);
      });
    } else {
      storage.markAllNotificationsAsRead(user?.id);
    }
    success('Notifications Marked as Read');
  };

  const exportCSV = (filteredList?: Complaint[]) => {
    storage.exportComplaintsToCSV(filteredList || complaints);
    success('CSV Exported', 'Complaints file downloaded successfully');
  };

  const editComplaint = async (
    complaintId: string,
    updates: {
      title?: string;
      description?: string;
      category?: any;
      priority?: Priority;
      location?: string;
    }
  ): Promise<Complaint | null> => {
    if (isApiMode) {
      try {
        const updated = await complaintsApi.updateComplaint(complaintId, updates);
        if (updated) {
          setComplaints((prev) =>
            prev.map((c) =>
              c.id.toLowerCase() === complaintId.toLowerCase() ? updated : c
            )
          );
          return updated;
        }
        return null;
      } catch (err: any) {
        toastError('Edit Failed', err?.message || 'Failed to update complaint.');
        return null;
      }
    } else {
      // Local storage fallback: find and update
      const existing = complaints.find((c) => c.id.toLowerCase() === complaintId.toLowerCase());
      if (!existing) return null;
      const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
      setComplaints((prev) =>
        prev.map((c) => (c.id.toLowerCase() === complaintId.toLowerCase() ? updated : c))
      );
      return updated;
    }
  };

  const deleteComplaint = async (complaintId: string): Promise<boolean> => {
    if (isApiMode) {
      try {
        await complaintsApi.deleteComplaint(complaintId);
        setComplaints((prev) =>
          prev.filter((c) => c.id.toLowerCase() !== complaintId.toLowerCase())
        );
        return true;
      } catch (err: any) {
        toastError('Delete Failed', err?.message || 'Failed to delete complaint.');
        return false;
      }
    } else {
      setComplaints((prev) =>
        prev.filter((c) => c.id.toLowerCase() !== complaintId.toLowerCase())
      );
      return true;
    }
  };

  // In API mode, the backend enforces authorized notification ownership.
  // In local mode, filter using student complaint ownership.
  const userNotifications = isApiMode
    ? notifications
    : notifications.filter((n) => {
        if (!user) return true;
        if (user.role === 'admin') {
          return (
            n.userId === user.id ||
            n.userId === 'all' ||
            n.type === 'urgent' ||
            (n as any).type === 'system'
          );
        }
        return (
          n.userId === user.id ||
          (user.email === 'harman.student@demo.pup.ac.in' &&
            n.userId === 'user-student-1')
        );
      });

  const unreadNotificationCount = userNotifications.filter((n) => !n.read).length;

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        notifications: userNotifications,
        unreadNotificationCount,
        loading,
        isApiMode,
        providerError,
        refreshComplaints,
        getComplaintById,
        fetchComplaintById,
        createComplaint,
        editComplaint,
        deleteComplaint,
        updateStatus,
        assignOfficer,
        addComment,
        markNotificationRead,
        markAllNotificationsRead,
        exportCSV,
      }}
    >
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = (): ComplaintContextType => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaints must be used within a ComplaintProvider');
  }
  return context;
};
