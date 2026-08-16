import type {
  Complaint,
  ComplaintStatus,
  Comment,
  UserRole,
} from '../types/index.js';
import {
  getComplaintRepository,
} from '../repositories/index.js';
import type {
  ComplaintFilterOptions,
  CreateComplaintDto,
  PatchComplaintDto,
  AddCommentDto,
} from '../repositories/index.js';
import { notificationService } from './notificationService.js';
import { AppError } from '../middleware/errorHandler.js';

export type { ComplaintFilterOptions };

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
  public async getAll(filters: ComplaintFilterOptions = {}): Promise<Complaint[]> {
    const repo = getComplaintRepository();
    return repo.getAll(filters);
  }

  public async getById(id: string): Promise<Complaint> {
    const repo = getComplaintRepository();
    const complaint = await repo.getById(id);

    if (!complaint) {
      throw new AppError(`Complaint with ID '${id}' was not found.`, 404);
    }

    return complaint;
  }

  public async create(data: CreateComplaintDto): Promise<Complaint> {
    const repo = getComplaintRepository();
    const newComplaint = await repo.create(data);

    // Create notification
    await notificationService.createNotification({
      userId: newComplaint.studentId,
      title: 'Complaint Submitted',
      message: `Your complaint #${newComplaint.id} has been registered and queued for triage.`,
      type: 'status_change',
      complaintId: newComplaint.id,
    });

    return newComplaint;
  }

  public async patch(
    id: string,
    patchData: PatchComplaintDto
  ): Promise<Complaint> {
    const complaint = await this.getById(id);
    const repo = getComplaintRepository();
    const updated = await repo.patch(id, patchData);

    if (!updated) {
      throw new AppError(`Failed to update complaint '${id}'.`, 500);
    }

    if (patchData.assignedTo && patchData.assignedDepartment) {
      await notificationService.createNotification({
        userId: complaint.studentId,
        title: 'Officer Assigned',
        message: `${patchData.assignedTo} from ${patchData.assignedDepartment} was assigned to #${complaint.id}.`,
        type: 'assignment',
        complaintId: complaint.id,
      });
    }

    return updated;
  }

  public async updateStatus(
    id: string,
    newStatus: ComplaintStatus,
    notes?: string,
    department?: string,
    updatedBy?: string,
    role?: UserRole
  ): Promise<Complaint> {
    const complaint = await this.getById(id);
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

    const repo = getComplaintRepository();
    const updated = await repo.updateStatus(id, {
      status: newStatus,
      notes,
      department,
      updatedBy,
      role,
    });

    if (!updated) {
      throw new AppError(`Failed to update status for complaint '${id}'.`, 500);
    }

    // Create notification
    await notificationService.createNotification({
      userId: complaint.studentId,
      title: 'Status Updated',
      message: `Complaint #${complaint.id} status changed to ${newStatus}.`,
      type: 'status_change',
      complaintId: complaint.id,
    });

    return updated;
  }

  public async addComment(
    id: string,
    data: AddCommentDto
  ): Promise<{ comment: Comment; complaint: Complaint }> {
    const complaint = await this.getById(id);
    const repo = getComplaintRepository();
    const result = await repo.addComment(id, data);

    if (!result) {
      throw new AppError(`Failed to add comment to complaint '${id}'.`, 500);
    }

    if (!data.isInternal) {
      await notificationService.createNotification({
        userId: data.userRole === 'admin' ? complaint.studentId : 'all',
        title: 'New Response on Complaint',
        message: `${result.comment.userName} commented on #${complaint.id}.`,
        type: 'comment',
        complaintId: complaint.id,
      });
    }

    return result;
  }
}

export const complaintService = new ComplaintService();
