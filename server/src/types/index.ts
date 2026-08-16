export type UserRole = 'student' | 'admin' | 'faculty';

export type ComplaintCategory =
  | 'Hostel'
  | 'Classroom'
  | 'Electricity'
  | 'Water'
  | 'Sanitation'
  | 'Internet'
  | 'Transportation'
  | 'Infrastructure'
  | 'Security'
  | 'Other';

export type ComplaintStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Closed';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rollNo?: string;
  department: string;
  hostel?: string;
  phone?: string;
  avatar?: string;
  joinedDate: string;
  status: 'Active' | 'Inactive';
}

export interface Comment {
  id: string;
  complaintId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  timestamp: string;
  isInternal?: boolean;
  avatar?: string;
}

export interface StatusHistory {
  id: string;
  status: ComplaintStatus;
  timestamp: string;
  updatedBy: string;
  role: UserRole;
  notes?: string;
  department?: string;
}

export interface ComplaintAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  priority: Priority;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  studentName: string;
  studentRollNo?: string;
  studentDepartment?: string;
  assignedTo?: string;
  assignedDepartment?: string;
  statusHistory: StatusHistory[];
  comments: Comment[];
  attachments: ComplaintAttachment[];
  resolvedAt?: string;
  isEscalated?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'comment' | 'urgent' | 'general';
  complaintId?: string;
  read: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  contactEmail: string;
  leadOfficer: string;
  activeComplaints: number;
  resolvedComplaints: number;
}

export interface AuthResponseData {
  user: User;
  token?: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresVerification?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: string[];
  timestamp: string;
}

export const VALID_CATEGORIES: ComplaintCategory[] = [
  'Hostel',
  'Classroom',
  'Electricity',
  'Water',
  'Sanitation',
  'Internet',
  'Transportation',
  'Infrastructure',
  'Security',
  'Other',
];

export const VALID_STATUSES: ComplaintStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const VALID_PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

// Lifecycle status transitions order
export const STATUS_PROGRESSION: Record<ComplaintStatus, number> = {
  Submitted: 0,
  'Under Review': 1,
  Assigned: 2,
  'In Progress': 3,
  Resolved: 4,
  Closed: 5,
};

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
