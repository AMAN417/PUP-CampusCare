import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Complaint, ComplaintStatus, Priority, Notification, UserRole } from '../types';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface ComplaintContextType {
  complaints: Complaint[];
  notifications: Notification[];
  unreadNotificationCount: number;
  loading: boolean;
  refreshComplaints: () => void;
  getComplaintById: (id: string) => Complaint | undefined;
  createComplaint: (data: {
    title: string;
    description: string;
    category: any;
    location: string;
    priority: Priority;
    attachments?: any[];
  }) => Complaint;
  updateStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    notes?: string,
    department?: string
  ) => boolean;
  assignOfficer: (complaintId: string, department: string, officer: string) => boolean;
  addComment: (complaintId: string, message: string, isInternal?: boolean) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  exportCSV: (filteredList?: Complaint[]) => void;
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined);

export const ComplaintProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(() => storage.getComplaints());
  const [notifications, setNotifications] = useState<Notification[]>(() => storage.getNotifications());
  const [loading] = useState<boolean>(false);

  const refreshComplaints = useCallback(() => {
    setComplaints(storage.getComplaints());
    setNotifications(storage.getNotifications());
  }, []);

  // Listen for storage events (e.g. across multi-tab or updates)
  useEffect(() => {
    const handleStorageChange = () => {
      refreshComplaints();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshComplaints]);

  const getComplaintById = useCallback(
    (id: string): Complaint | undefined => {
      return complaints.find((c) => c.id.toLowerCase() === id.toLowerCase());
    },
    [complaints]
  );

  const createComplaint = (data: {
    title: string;
    description: string;
    category: any;
    location: string;
    priority: Priority;
    attachments?: any[];
  }): Complaint => {
    try {
      const studentName = user?.name || 'Harmanpreet Singh';
      const studentId = user?.id || 'user-student-1';
      const studentRollNo = user?.rollNo || 'PUP2024-CS-042';
      const studentDepartment = user?.department || 'Computer Science & Engineering';

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
      success('Complaint Submitted Successfully!', `Reference ID: ${newComplaint.id}`);
      return newComplaint;
    } catch (err) {
      toastError('Failed to submit complaint', 'Please check required fields.');
      throw err;
    }
  };

  const updateStatus = (
    complaintId: string,
    newStatus: ComplaintStatus,
    notes?: string,
    department?: string
  ): boolean => {
    try {
      const adminInfo = {
        name: user?.name || 'Campus Administrator',
        role: (user?.role || 'admin') as UserRole,
      };

      const updated = storage.updateComplaintStatus(
        complaintId,
        newStatus,
        adminInfo,
        notes,
        department
      );

      if (updated) {
        refreshComplaints();
        success('Status Updated', `Complaint ${complaintId} is now ${newStatus}`);
        return true;
      }
      return false;
    } catch {
      toastError('Error updating status');
      return false;
    }
  };

  const assignOfficer = (complaintId: string, department: string, officer: string): boolean => {
    try {
      const adminInfo = {
        name: user?.name || 'Campus Administrator',
        role: (user?.role || 'admin') as UserRole,
      };

      const updated = storage.assignComplaint(complaintId, department, officer, adminInfo);
      if (updated) {
        refreshComplaints();
        success('Officer Assigned', `${officer} (${department}) assigned to ${complaintId}`);
        return true;
      }
      return false;
    } catch {
      toastError('Error assigning officer');
      return false;
    }
  };

  const addComment = (complaintId: string, message: string, isInternal: boolean = false): boolean => {
    if (!user) return false;
    try {
      const comment = storage.addComment(complaintId, user, message, isInternal);
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
  };

  const markNotificationRead = (id: string) => {
    storage.markNotificationAsRead(id);
    refreshComplaints();
  };

  const markAllNotificationsRead = () => {
    storage.markAllNotificationsAsRead(user?.id);
    refreshComplaints();
    success('Notifications Marked as Read');
  };

  const exportCSV = (filteredList?: Complaint[]) => {
    storage.exportComplaintsToCSV(filteredList || complaints);
    success('CSV Exported', 'Complaints file downloaded successfully');
  };

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter((n) => {
    if (!user) return true;
    if (user.role === 'admin') {
      return n.userId === user.id || n.userId === 'all' || n.type === 'urgent' || n.type === 'system';
    }
    return n.userId === user.id || n.userId === 'all';
  });

  const unreadNotificationCount = userNotifications.filter((n) => !n.read).length;

  return (
    <ComplaintContext.Provider
      value={{
        complaints,
        notifications: userNotifications,
        unreadNotificationCount,
        loading,
        refreshComplaints,
        getComplaintById,
        createComplaint,
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
