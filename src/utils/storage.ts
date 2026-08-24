import type {
  Complaint,
  Notification,
  User,
  Department,
  ComplaintStatus,
  UserRole,
  Comment,
  StatusHistory,
} from '../types';
import {
  INITIAL_COMPLAINTS,
  INITIAL_NOTIFICATIONS,
  DEMO_USERS,
  DEMO_DEPARTMENTS,
} from '../data/mockData';

const STORAGE_KEYS = {
  COMPLAINTS: 'pup_campuscare_complaints_v1',
  NOTIFICATIONS: 'pup_campuscare_notifications_v1',
  USERS: 'pup_campuscare_users_v1',
  DEPARTMENTS: 'pup_campuscare_departments_v1',
  CURRENT_USER: 'pup_campuscare_current_user_v1',
};

// Helper for safe localStorage access
const isBrowser = typeof window !== 'undefined';

const getFromStorage = <T>(key: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return fallback;
  }
};

const saveToStorage = <T>(key: string, data: T): void => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
};

// Initialize default storage data if missing
export const initStorage = (): void => {
  if (!isBrowser) return;
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    saveToStorage(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    saveToStorage(STORAGE_KEYS.USERS, DEMO_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEPARTMENTS)) {
    saveToStorage(STORAGE_KEYS.DEPARTMENTS, DEMO_DEPARTMENTS);
  }
};

// Ensure initialized on module load
initStorage();

export const storage = {
  // User operations
  getCurrentUser: (): User | null => {
    return getFromStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  setCurrentUser: (user: User | null): void => {
    if (user === null) {
      if (isBrowser) localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
    }
  },

  getUsers: (): User[] => {
    return getFromStorage<User[]>(STORAGE_KEYS.USERS, DEMO_USERS);
  },

  getUserById: (id: string): User | undefined => {
    const users = storage.getUsers();
    return users.find((u) => u.id === id);
  },

  saveUser: (newUser: User): void => {
    const users = storage.getUsers();
    const index = users.findIndex((u) => u.id === newUser.id);
    if (index >= 0) {
      users[index] = newUser;
    } else {
      users.unshift(newUser);
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
  },

  // Complaint operations
  getComplaints: (): Complaint[] => {
    return getFromStorage<Complaint[]>(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
  },

  getComplaintById: (id: string): Complaint | undefined => {
    const complaints = storage.getComplaints();
    return complaints.find((c) => c.id === id);
  },

  generateComplaintId: (): string => {
    const complaints = storage.getComplaints();
    const currentYear = new Date().getFullYear();
    const prefix = `PUP-${currentYear}-`;
    const matchingIds = complaints
      .map((c) => c.id)
      .filter((id) => id.startsWith(prefix))
      .map((id) => {
        const numPart = id.replace(prefix, '');
        return parseInt(numPart, 10);
      })
      .filter((num) => !isNaN(num));

    const maxNum = matchingIds.length > 0 ? Math.max(...matchingIds) : 100;
    const nextNum = (maxNum + 1).toString().padStart(4, '0');
    return `${prefix}${nextNum}`;
  },

  saveComplaint: (newComplaint: Partial<Complaint> & { title: string; category: any }): Complaint => {
    const complaints = storage.getComplaints();
    const id = newComplaint.id || storage.generateComplaintId();
    const timestamp = new Date().toISOString();

    const createdComplaint: Complaint = {
      id,
      title: newComplaint.title,
      description: newComplaint.description || '',
      category: newComplaint.category,
      location: newComplaint.location || 'General Campus',
      priority: newComplaint.priority || 'Medium',
      status: 'Submitted',
      createdAt: timestamp,
      updatedAt: timestamp,
      studentId: newComplaint.studentId || 'user-student-1',
      studentName: newComplaint.studentName || 'Harmanpreet Singh',
      studentRollNo: newComplaint.studentRollNo || 'PUP2024-CS-042',
      studentDepartment: newComplaint.studentDepartment || 'Computer Science & Engineering',
      statusHistory: [
        {
          id: `sh-${Date.now()}`,
          status: 'Submitted',
          timestamp,
          updatedBy: newComplaint.studentName || 'Harmanpreet Singh',
          role: 'student',
          notes: 'Complaint submitted online via CampusCare portal.',
        },
      ],
      comments: [],
      attachments: newComplaint.attachments || [],
    };

    complaints.unshift(createdComplaint);
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);

    // Notify admins
    storage.addNotification({
      id: `notif-${Date.now()}`,
      userId: 'user-admin-1',
      title: 'New Complaint Received',
      message: `New complaint logged: ${createdComplaint.title} (${createdComplaint.id}) in ${createdComplaint.category}.`,
      type: createdComplaint.priority === 'Urgent' ? 'urgent' : 'system',
      read: false,
      createdAt: timestamp,
      complaintId: createdComplaint.id,
    });

    return createdComplaint;
  },

  updateComplaintStatus: (
    complaintId: string,
    newStatus: ComplaintStatus,
    adminUser: { name: string; role: UserRole },
    notes?: string,
    department?: string
  ): Complaint | null => {
    const complaints = storage.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const timestamp = new Date().toISOString();

    const historyItem: StatusHistory = {
      id: `sh-${Date.now()}`,
      status: newStatus,
      timestamp,
      updatedBy: adminUser.name,
      role: adminUser.role,
      notes: notes || `Status updated to ${newStatus}.`,
      department: department || complaint.assignedDepartment,
    };

    complaint.status = newStatus;
    complaint.updatedAt = timestamp;
    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      complaint.resolvedAt = timestamp;
    }
    complaint.statusHistory.push(historyItem);

    complaints[index] = complaint;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);

    // Generate notification for student
    storage.addNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: `Status: ${newStatus}`,
      message: `Your complaint (${complaint.id}) is now "${newStatus}". ${notes ? `"${notes}"` : ''}`,
      type: 'status_change',
      read: false,
      createdAt: timestamp,
      complaintId: complaint.id,
    });

    return complaint;
  },

  assignComplaint: (
    complaintId: string,
    department: string,
    officer: string,
    adminUser: { name: string; role: UserRole }
  ): Complaint | null => {
    const complaints = storage.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const timestamp = new Date().toISOString();

    complaint.assignedDepartment = department;
    complaint.assignedTo = officer;
    complaint.updatedAt = timestamp;

    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    complaint.statusHistory.push({
      id: `sh-${Date.now()}`,
      status: complaint.status,
      timestamp,
      updatedBy: adminUser.name,
      role: adminUser.role,
      notes: `Assigned to ${officer} (${department}).`,
      department,
    });

    complaints[index] = complaint;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);

    // Notify student
    storage.addNotification({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: 'Officer Assigned',
      message: `Officer ${officer} from ${department} has been assigned to your complaint (${complaint.id}).`,
      type: 'assignment',
      read: false,
      createdAt: timestamp,
      complaintId: complaint.id,
    });

    return complaint;
  },

  // Partially update editable fields of a complaint (student edit flow)
  updateComplaintFields: (
    complaintId: string,
    updates: Partial<
      Pick<Complaint, 'title' | 'description' | 'category' | 'priority' | 'location'>
    >
  ): Complaint | null => {
    const complaints = storage.getComplaints();
    const index = complaints.findIndex(
      (c) => c.id.toLowerCase() === complaintId.toLowerCase()
    );
    if (index === -1) return null;

    const updated: Complaint = {
      ...complaints[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    complaints[index] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);
    return updated;
  },

  removeComplaint: (complaintId: string): boolean => {
    const complaints = storage.getComplaints();
    const index = complaints.findIndex(
      (c) => c.id.toLowerCase() === complaintId.toLowerCase()
    );
    if (index === -1) return false;
    complaints.splice(index, 1);
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);
    return true;
  },

  addComment: (
    complaintId: string,
    user: User,
    message: string,
    isInternal: boolean = false
  ): Comment | null => {
    const complaints = storage.getComplaints();
    const index = complaints.findIndex((c) => c.id === complaintId);
    if (index === -1) return null;

    const complaint = complaints[index];
    const timestamp = new Date().toISOString();

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      complaintId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      message,
      timestamp,
      isInternal,
      avatar: user.avatar,
    };

    complaint.comments.push(newComment);
    complaint.updatedAt = timestamp;
    complaints[index] = complaint;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaints);

    // Send notification to the other party
    if (!isInternal) {
      const recipientId = user.role === 'student' ? 'user-admin-1' : complaint.studentId;
      storage.addNotification({
        id: `notif-${Date.now()}`,
        userId: recipientId,
        title: `New Comment on ${complaint.id}`,
        message: `${user.name} commented: "${message.length > 50 ? message.substring(0, 50) + '...' : message}"`,
        type: 'comment',
        read: false,
        createdAt: timestamp,
        complaintId: complaint.id,
      });
    }

    return newComment;
  },

  // Notification operations
  getNotifications: (userId?: string): Notification[] => {
    const notifs = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId || userId === 'all' || userId === 'user-admin-1') return notifs;

    // Isolate by student's owned complaints
    const complaints = storage.getComplaints();
    const studentComplaints = complaints.filter(
      (c) =>
        c.studentId === userId ||
        (userId === 'user-student-1' &&
          (c.studentId === 'user-student-1' || c.studentName === 'Harmanpreet Singh'))
    );

    if (studentComplaints.length === 0) return [];
    const ownedIds = new Set(studentComplaints.map((c) => c.id.toUpperCase()));
    return notifs.filter(
      (n) => n.complaintId && ownedIds.has(n.complaintId.toUpperCase())
    );
  },

  addNotification: (notification: Notification): void => {
    const notifs = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    notifs.unshift(notification);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
  },

  markNotificationAsRead: (id: string): void => {
    const notifs = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    const index = notifs.findIndex((n) => n.id === id);
    if (index >= 0) {
      notifs[index].read = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
  },

  markAllNotificationsAsRead: (userId?: string): void => {
    const notifs = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!userId || userId === 'all' || userId === 'user-admin-1') {
      const updated = notifs.map((n) => ({ ...n, read: true }));
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
      return;
    }

    const complaints = storage.getComplaints();
    const studentComplaints = complaints.filter(
      (c) =>
        c.studentId === userId ||
        (userId === 'user-student-1' &&
          (c.studentId === 'user-student-1' || c.studentName === 'Harmanpreet Singh'))
    );
    const ownedIds = new Set(studentComplaints.map((c) => c.id.toUpperCase()));

    const updated = notifs.map((n) => {
      if (n.complaintId && ownedIds.has(n.complaintId.toUpperCase())) {
        return { ...n, read: true };
      }
      return n;
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  // Department operations
  getDepartments: (): Department[] => {
    return getFromStorage<Department[]>(STORAGE_KEYS.DEPARTMENTS, DEMO_DEPARTMENTS);
  },

  // Reset demo storage to original state
  resetDemoData: (): void => {
    saveToStorage(STORAGE_KEYS.COMPLAINTS, INITIAL_COMPLAINTS);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    saveToStorage(STORAGE_KEYS.USERS, DEMO_USERS);
    saveToStorage(STORAGE_KEYS.DEPARTMENTS, DEMO_DEPARTMENTS);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, DEMO_USERS[0]);
  },

  // CSV Export utility
  exportComplaintsToCSV: (complaintsList?: Complaint[]): void => {
    if (!isBrowser) return;
    const complaints = complaintsList || storage.getComplaints();
    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Status',
      'Priority',
      'Location',
      'Student Name',
      'Roll Number',
      'Department',
      'Assigned Officer',
      'Assigned Dept',
      'Created At',
      'Last Updated',
    ];

    // Escape a field for CSV: wrap in quotes and double up inner quotes so
    // commas, newlines, and quote characters cannot break the row structure.
    const escapeCsvField = (value: unknown): string => {
      const str = value === null || value === undefined ? '' : String(value);
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = complaints.map((c) =>
      [
        c.id,
        c.title,
        c.category,
        c.status,
        c.priority,
        c.location,
        c.studentName,
        c.studentRollNo,
        c.studentDepartment,
        c.assignedTo || 'Unassigned',
        c.assignedDepartment || 'None',
        new Date(c.createdAt).toLocaleString(),
        new Date(c.updatedAt).toLocaleString(),
      ]
        .map(escapeCsvField)
        .join(',')
    );

    const csvContent = [headers.map(escapeCsvField).join(','), ...rows].join('\r\n');

    // Use a Blob instead of a data: URI — data URIs silently truncate on
    // characters like '#' and cannot represent arbitrary user content.
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', blobUrl);
    link.setAttribute('download', `PUP_CampusCare_Complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  },
};
