import { Request, Response, NextFunction } from 'express';
import { complaintService, ComplaintFilterOptions } from '../services/complaintService.js';
import {
  ApiResponse,
  Complaint,
  Comment,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
} from '../types/index.js';
import type { PatchComplaintDto } from '../repositories/interfaces.js';
import { AppError } from '../middleware/errorHandler.js';

import { isStudentComplaintOwner } from '../utils/ownership.js';

export const getComplaints = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    const isStudent = user?.role === 'student';

    const filters: ComplaintFilterOptions = {
      category: req.query.category as ComplaintCategory | undefined,
      status: req.query.status as ComplaintStatus | undefined,
      priority: req.query.priority as Priority | undefined,
      search: req.query.search as string | undefined,
      // For student, enforce their student ID filter; for admin, allow query filter if provided
      studentId: isStudent ? user?.id : (req.query.studentId as string | undefined),
    };

    let complaints = await complaintService.getAll(filters);

    // Strict server-side enforcement: Students can only view their own complaints
    if (isStudent && user) {
      complaints = complaints.filter((c) => isStudentComplaintOwner(c, user));
    }

    const response: ApiResponse<Complaint[]> = {
      success: true,
      message: `Retrieved ${complaints.length} complaint(s).`,
      data: complaints,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const complaint = await complaintService.getById(id);

    // Student privacy check: Students can only retrieve their own complaints
    if (req.user?.role === 'student' && !isStudentComplaintOwner(complaint, req.user)) {
      throw new AppError('Access denied: You can only view your own complaints.', 403);
    }

    const response: ApiResponse<Complaint> = {
      success: true,
      data: complaint,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required to submit complaints.', 401);
    }

    // Zero-trust frontend payload: strictly derive student identity from authenticated session
    const complaintPayload = {
      ...req.body,
      studentId: req.user.id,
      studentName: req.user.name,
      studentRollNo: req.user.rollNo || undefined,
      studentDepartment: req.user.department || 'General',
    };

    const newComplaint = await complaintService.create(complaintPayload);

    const response: ApiResponse<Complaint> = {
      success: true,
      message: `Complaint #${newComplaint.id} submitted successfully.`,
      data: newComplaint,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const patchComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      throw new AppError('Authentication required.', 401);
    }

    let patchData: PatchComplaintDto;

    if (user.role === 'student') {
      // Students: verify ownership first
      const complaint = await complaintService.getById(id);
      if (!isStudentComplaintOwner(complaint, user)) {
        throw new AppError('Access denied: You can only edit your own complaints.', 403);
      }
      // Whitelist: students may only edit these fields
      const { title, description, category, priority, location } = req.body;
      patchData = {};
      if (title !== undefined) patchData.title = title;
      if (description !== undefined) patchData.description = description;
      if (category !== undefined) patchData.category = category;
      if (priority !== undefined) patchData.priority = priority;
      if (location !== undefined) patchData.location = location;
    } else {
      // Admins: allow all patch fields
      patchData = req.body as PatchComplaintDto;
    }

    const updated = await complaintService.patch(id, patchData);

    const response: ApiResponse<Complaint> = {
      success: true,
      message: `Complaint #${updated.id} updated successfully.`,
      data: updated,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      throw new AppError('Authentication required.', 401);
    }

    await complaintService.deleteComplaint(id, user.id, user.role);

    const response: ApiResponse<null> = {
      success: true,
      message: `Complaint #${id} has been deleted.`,
      data: null,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes, department } = req.body;

    // Server-side audit details: record verified updater name and role
    const updatedBy = req.user?.name || 'Administrator';
    const role = req.user?.role || 'admin';

    const updated = await complaintService.updateStatus(
      id,
      status,
      notes,
      department,
      updatedBy,
      role
    );

    const response: ApiResponse<Complaint> = {
      success: true,
      message: `Complaint #${updated.id} status advanced to '${status}'.`,
      data: updated,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const addComplaintComment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user;

    if (!user) {
      throw new AppError('Authentication required to add comments.', 401);
    }

    const complaint = await complaintService.getById(id);

    // If user is a student, verify they own the complaint
    if (user.role === 'student' && !isStudentComplaintOwner(complaint, user)) {
      throw new AppError('Access denied: You can only comment on your own complaints.', 403);
    }

    // Zero-trust frontend payload: derive author details from authenticated user
    const commentPayload = {
      message: req.body.message,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      isInternal: user.role === 'admin' ? Boolean(req.body.isInternal) : false,
      avatar: user.avatar,
    };

    const { comment, complaint: updatedComplaint } = await complaintService.addComment(
      id,
      commentPayload
    );

    const response: ApiResponse<{ comment: Comment; complaint: Complaint }> = {
      success: true,
      message: 'Comment posted successfully.',
      data: { comment, complaint: updatedComplaint },
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
