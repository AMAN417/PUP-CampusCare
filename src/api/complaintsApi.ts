import { apiClient } from './apiClient';
import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
  Comment,
  UserRole,
} from '../types';

export interface ComplaintFilterParams {
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: Priority;
  search?: string;
  studentId?: string;
}

export interface CreateComplaintPayload {
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

export interface PatchComplaintPayload {
  // Admin-only fields
  assignedDepartment?: string;
  assignedTo?: string;
  isEscalated?: boolean;
  // Student-editable fields (own complaint only)
  priority?: Priority;
  title?: string;
  description?: string;
  category?: ComplaintCategory;
  location?: string;
}

export interface UpdateStatusPayload {
  status: ComplaintStatus;
  notes?: string;
  department?: string;
  updatedBy?: string;
  role?: UserRole;
}

export interface AddCommentPayload {
  message: string;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  isInternal?: boolean;
  avatar?: string;
}

export const complaintsApi = {
  getComplaints: async (filters: ComplaintFilterParams = {}): Promise<Complaint[]> => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.studentId) params.append('studentId', filters.studentId);

    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Complaint[]>(`/complaints${query}`);
  },

  getComplaintById: async (id: string): Promise<Complaint> => {
    return apiClient.get<Complaint>(`/complaints/${encodeURIComponent(id)}`);
  },

  createComplaint: async (payload: CreateComplaintPayload): Promise<Complaint> => {
    return apiClient.post<Complaint>('/complaints', payload);
  },

  patchComplaint: async (
    id: string,
    payload: PatchComplaintPayload
  ): Promise<Complaint> => {
    return apiClient.patch<Complaint>(`/complaints/${encodeURIComponent(id)}`, payload);
  },

  // Student-facing: update own complaint's editable fields
  updateComplaint: async (
    id: string,
    payload: Pick<PatchComplaintPayload, 'title' | 'description' | 'category' | 'priority' | 'location'>
  ): Promise<Complaint> => {
    return apiClient.patch<Complaint>(`/complaints/${encodeURIComponent(id)}`, payload);
  },

  // Student-facing: delete own complaint
  deleteComplaint: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/complaints/${encodeURIComponent(id)}`);
  },

  updateStatus: async (
    id: string,
    payload: UpdateStatusPayload
  ): Promise<Complaint> => {
    return apiClient.post<Complaint>(
      `/complaints/${encodeURIComponent(id)}/status`,
      payload
    );
  },

  addComment: async (
    id: string,
    payload: AddCommentPayload
  ): Promise<{ comment: Comment; complaint: Complaint }> => {
    return apiClient.post<{ comment: Comment; complaint: Complaint }>(
      `/complaints/${encodeURIComponent(id)}/comments`,
      payload
    );
  },
};
