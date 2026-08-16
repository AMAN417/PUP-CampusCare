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

export const getComplaints = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const filters: ComplaintFilterOptions = {
      category: req.query.category as ComplaintCategory | undefined,
      status: req.query.status as ComplaintStatus | undefined,
      priority: req.query.priority as Priority | undefined,
      search: req.query.search as string | undefined,
      studentId: req.query.studentId as string | undefined,
    };

    const complaints = complaintService.getAll(filters);

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

export const getComplaintById = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = req.params.id as string;
    const complaint = complaintService.getById(id);

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

export const createComplaint = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const newComplaint = complaintService.create(req.body);

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

export const patchComplaint = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = req.params.id as string;
    const updated = complaintService.patch(id, req.body);

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

export const updateComplaintStatus = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = req.params.id as string;
    const { status, notes, department, updatedBy, role } = req.body;
    const updated = complaintService.updateStatus(
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

export const addComplaintComment = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const id = req.params.id as string;
    const { comment, complaint } = complaintService.addComment(
      id,
      req.body
    );

    const response: ApiResponse<{ comment: Comment; complaint: Complaint }> = {
      success: true,
      message: 'Comment posted successfully.',
      data: { comment, complaint },
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};
