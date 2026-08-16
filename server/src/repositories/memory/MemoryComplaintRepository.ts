import {
  IComplaintRepository,
  ComplaintFilterOptions,
  CreateComplaintDto,
  PatchComplaintDto,
  UpdateStatusDto,
  AddCommentDto,
} from '../interfaces.js';
import {
  Complaint,
  Comment,
  StatusHistory,
} from '../../types/index.js';
import { INITIAL_COMPLAINTS } from '../../data/initialData.js';

export class MemoryComplaintRepository implements IComplaintRepository {
  private complaints: Complaint[] = JSON.parse(JSON.stringify(INITIAL_COMPLAINTS));

  public async getAll(filters: ComplaintFilterOptions = {}): Promise<Complaint[]> {
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

  public async getById(id: string): Promise<Complaint | null> {
    const cleanId = id.trim().toUpperCase();
    const found = this.complaints.find(
      (c) => c.id.toUpperCase() === cleanId
    );
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  public async create(data: CreateComplaintDto): Promise<Complaint> {
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
    return JSON.parse(JSON.stringify(newComplaint));
  }

  public async patch(
    id: string,
    data: PatchComplaintDto
  ): Promise<Complaint | null> {
    const index = this.complaints.findIndex(
      (c) => c.id.toUpperCase() === id.trim().toUpperCase()
    );
    if (index === -1) return null;

    const complaint = this.complaints[index];
    const now = new Date().toISOString();

    if (data.assignedDepartment !== undefined) {
      complaint.assignedDepartment = data.assignedDepartment;
    }
    if (data.assignedTo !== undefined) {
      complaint.assignedTo = data.assignedTo;
    }
    if (data.priority !== undefined) {
      complaint.priority = data.priority;
    }
    if (data.isEscalated !== undefined) {
      complaint.isEscalated = data.isEscalated;
    }

    complaint.updatedAt = now;
    return JSON.parse(JSON.stringify(complaint));
  }

  public async updateStatus(
    id: string,
    data: UpdateStatusDto
  ): Promise<Complaint | null> {
    const index = this.complaints.findIndex(
      (c) => c.id.toUpperCase() === id.trim().toUpperCase()
    );
    if (index === -1) return null;

    const complaint = this.complaints[index];
    const now = new Date().toISOString();

    complaint.status = data.status;
    complaint.updatedAt = now;

    if (data.status === 'Resolved' || data.status === 'Closed') {
      complaint.resolvedAt = now;
    }

    if (data.department) {
      complaint.assignedDepartment = data.department;
    }

    const historyEntry: StatusHistory = {
      id: `hist-${Date.now()}`,
      status: data.status,
      timestamp: now,
      updatedBy: data.updatedBy || 'Campus Administrator',
      role: data.role || 'admin',
      notes: data.notes || `Status updated to ${data.status}`,
      department: data.department || complaint.assignedDepartment,
    };

    complaint.statusHistory.push(historyEntry);
    return JSON.parse(JSON.stringify(complaint));
  }

  public async addComment(
    id: string,
    data: AddCommentDto
  ): Promise<{ comment: Comment; complaint: Complaint } | null> {
    const index = this.complaints.findIndex(
      (c) => c.id.toUpperCase() === id.trim().toUpperCase()
    );
    if (index === -1) return null;

    const complaint = this.complaints[index];
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
      avatar: data.avatar,
    };

    complaint.comments.push(newComment);
    complaint.updatedAt = now;

    return {
      comment: JSON.parse(JSON.stringify(newComment)),
      complaint: JSON.parse(JSON.stringify(complaint)),
    };
  }
}
