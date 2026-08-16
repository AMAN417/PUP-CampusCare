import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
  Comment,
  UserRole,
  Notification,
  User,
  Department,
} from '../types/index.js';

export interface ComplaintFilterOptions {
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: Priority;
  search?: string;
  studentId?: string;
}

export interface CreateComplaintDto {
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  priority: Priority;
  studentId?: string;
  studentName?: string;
  studentRollNo?: string;
  studentDepartment?: string;
  attachments?: {
    id: string;
    name: string;
    size: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
}

export interface PatchComplaintDto {
  assignedDepartment?: string;
  assignedTo?: string;
  priority?: Priority;
  isEscalated?: boolean;
}

export interface UpdateStatusDto {
  status: ComplaintStatus;
  notes?: string;
  department?: string;
  updatedBy?: string;
  role?: UserRole;
}

export interface AddCommentDto {
  message: string;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  isInternal?: boolean;
  avatar?: string;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: 'status_change' | 'assignment' | 'comment' | 'urgent' | 'general';
  complaintId?: string;
}

export interface IComplaintRepository {
  getAll(filters?: ComplaintFilterOptions): Promise<Complaint[]>;
  getById(id: string): Promise<Complaint | null>;
  create(data: CreateComplaintDto): Promise<Complaint>;
  patch(id: string, data: PatchComplaintDto): Promise<Complaint | null>;
  updateStatus(id: string, data: UpdateStatusDto): Promise<Complaint | null>;
  addComment(
    id: string,
    data: AddCommentDto
  ): Promise<{ comment: Comment; complaint: Complaint } | null>;
}

export interface INotificationRepository {
  getAll(userId?: string): Promise<Notification[]>;
  create(data: CreateNotificationDto): Promise<Notification>;
  markAsRead(id: string): Promise<boolean>;
}

export interface IUserRepository {
  getAll(): Promise<User[]>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  create(user: Partial<User>): Promise<User>;
}

export interface IDepartmentRepository {
  getAll(): Promise<Department[]>;
  getById(id: string): Promise<Department | null>;
  getByCode(code: string): Promise<Department | null>;
  create(department: Partial<Department>): Promise<Department>;
}
