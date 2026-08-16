import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
  Comment,
  StatusHistory,
  UserRole,
} from '../types/index.js';
import { INITIAL_COMPLAINTS } from '../data/initialData.js';
import { notificationService } from './notificationService.js';
import { AppError } from '../middleware/errorHandler.js';

export interface ComplaintFilterOptions {
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: Priority;
  search?: string;
  studentId?: string;
}

// Strict lifecycle transitions
const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  Submitted: ['Under Review', 'Closed'],
  'Under Review': ['Assigned', 'Closed'],
  Assigned: ['In Progress', 'Closed'],
  'In Progress': ['Resolved', 'Closed'],
  Resolved: ['Closed', 'In Progress'],
  Closed: [], // Terminal status
};

export class ComplaintService {
  private complaints: Complaint[] = JSON.parse(JSON.stringify(INITIAL_COMPLAINTS));

  public getAll(filters: ComplaintFilterOptions = {}): Complaint[] {
    let result = [...this.complaints];

    if (filters.category) {
      result = result.filter((c) => c.category === filters.category);
    }

    if (filters.status) {
      result = result.filter((c) => c.status === filters.status);
    }

    if (filters.priority) {
      result = result.filter((c) => c.priority === filters.priority);
    }

    if (filters.studentId) {
      result = result.filter((c) => c.studentId === filters.studentId);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          (c.studentRollNo && c.studentRollNo.toLowerCase().includes(q))
      );
    }

    return result.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): Complaint {
    const complaint = this.complaints.find(
      (c) => c.id.toUpperCase() === id.trim().toUpperCase()
    );

    if (!complaint) {
      throw new AppError(`Complaint with ID '${id}' was not found.`, 404);
    }

    return complaint;
  }

  public create(data: {
    title: string;
    description: string;
    category: ComplaintCategory;
    location: string;
    priority: Priority;
    studentId?: string;
    studentName?: string;
    studentRollNo?: string;
    studentDepartment?: string;
    attachments?: { id: string; name: string; size: string; type: string; url: string; uploadedAt: string }[];
  }): Complaint {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `PUP-${year}-${randomSeq}`;
    const now = new Date().toISOString();

    const initialHistory: StatusHistory = {
      id: `hist-${Date.now()}`,
      status: 'Submitted',
      timestamp: now,
      updatedBy: data.studentName || 'Student (Harmanpreet Singh)',
      role: 'student',
      notes: 'Initial issue reported through Punjabi University Patiala CampusCare portal.',
    };

    const newComplaint: Complaint = {
      id: complaintId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      location: data.location.trim(),
      priority: data.priority,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
      studentId: data.studentId || 'user-student-1',
      studentName: data.studentName || 'Harmanpreet Singh',
      studentRollNo: data.studentRollNo || 'PUP2024-CS-042',
      studentDepartment:
        data.studentDepartment || 'Department of Computer Science & Engineering',
      statusHistory: [initialHistory],
      comments: [],
      attachments: data.attachments || [],
    };

    this.complaints.unshift(newComplaint);

    // Create notification
    notificationService.createNotification({
      userId: newComplaint.studentId,
      title: 'Complaint Submitted',
      message: `Your complaint #${newComplaint.id} has been registered and queued for triage.`,
      type: 'status_change',
      complaintId: newComplaint.id,
    });

    return newComplaint;
  }

  public patch(
    id: string,
    patchData: {
      assignedDepartment?: string;
      assignedTo?: string;
      priority?: Priority;
      isEscalated?: boolean;
    }
  ): Complaint {
    const complaint = this.getById(id);
    const now = new Date().toISOString();

    if (patchData.assignedDepartment !== undefined) {
      complaint.assignedDepartment = patchData.assignedDepartment;
    }
    if (patchData.assignedTo !== undefined) {
      complaint.assignedTo = patchData.assignedTo;
    }
    if (patchData.priority !== undefined) {
      complaint.priority = patchData.priority;
    }
    if (patchData.isEscalated !== undefined) {
      complaint.isEscalated = patchData.isEscalated;
    }

    complaint.updatedAt = now;

    if (patchData.assignedTo && patchData.assignedDepartment) {
      notificationService.createNotification({
        userId: complaint.studentId,
        title: 'Officer Assigned',
        message: `${patchData.assignedTo} from ${patchData.assignedDepartment} was assigned to #${complaint.id}.`,
        type: 'assignment',
        complaintId: complaint.id,
      });
    }

    return complaint;
  }

  public updateStatus(
    id: string,
    newStatus: ComplaintStatus,
    notes?: string,
    department?: string,
    updatedBy?: string,
    role?: UserRole
  ): Complaint {
    const complaint = this.getById(id);
    const currentStatus = complaint.status;

    // Check lifecycle transition rule
    if (currentStatus !== newStatus) {
      const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
      if (!allowed.includes(newStatus)) {
        throw new AppError(
          `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: ${
            allowed.length > 0 ? allowed.join(', ') : 'None (Terminal status)'
          }.`,
          400
        );
      }
    }

    const now = new Date().toISOString();
    complaint.status = newStatus;
    complaint.updatedAt = now;

    if (newStatus === 'Resolved' || newStatus === 'Closed') {
      complaint.resolvedAt = now;
    }

    if (department) {
      complaint.assignedDepartment = department;
    }

    const historyEntry: StatusHistory = {
      id: `hist-${Date.now()}`,
      status: newStatus,
      timestamp: now,
      updatedBy: updatedBy || 'Campus Administrator',
      role: role || 'admin',
      notes: notes || `Status updated to ${newStatus}`,
      department: department || complaint.assignedDepartment,
    };

    complaint.statusHistory.push(historyEntry);

    // Create notification
    notificationService.createNotification({
      userId: complaint.studentId,
      title: 'Status Updated',
      message: `Complaint #${complaint.id} status changed to ${newStatus}.`,
      type: 'status_change',
      complaintId: complaint.id,
    });

    return complaint;
  }

  public addComment(
    id: string,
    data: {
      message: string;
      userId?: string;
      userName?: string;
      userRole?: UserRole;
      isInternal?: boolean;
    }
  ): { comment: Comment; complaint: Complaint } {
    const complaint = this.getById(id);
    const now = new Date().toISOString();

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      complaintId: complaint.id,
      userId: data.userId || 'user-student-1',
      userName: data.userName || 'Harmanpreet Singh',
      userRole: data.userRole || 'student',
      message: data.message.trim(),
      timestamp: now,
      isInternal: data.isInternal || false,
    };

    complaint.comments.push(newComment);
    complaint.updatedAt = now;

    if (!data.isInternal) {
      notificationService.createNotification({
        userId: data.userRole === 'admin' ? complaint.studentId : 'all',
        title: 'New Response on Complaint',
        message: `${newComment.userName} commented on #${complaint.id}.`,
        type: 'comment',
        complaintId: complaint.id,
      });
    }

    return { comment: newComment, complaint };
  }
}

export const complaintService = new ComplaintService();
