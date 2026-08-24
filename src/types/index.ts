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

export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say' | 'Other';

export const GENDER_OPTIONS: Gender[] = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
  'Other',
];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  gender?: Gender;
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
  assignedTo?: string; // Officer Name
  assignedDepartment?: string;
  statusHistory: StatusHistory[];
  comments: Comment[];
  attachments: ComplaintAttachment[];
  resolvedAt?: string;
  isEscalated?: boolean;
}

export interface Notification {
  id: string;
  userId: string; // 'all' or specific user id or role 'student' | 'admin'
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'comment' | 'system' | 'urgent';
  read: boolean;
  createdAt: string;
  complaintId?: string;
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

export interface PlatformStat {
  totalComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  pendingComplaints: number;
  highPriorityComplaints: number;
  overdueComplaints: number;
  averageResolutionDays: number;
  satisfactionRate: number;
}
