import { Request, Response, NextFunction } from 'express';
import {
  VALID_CATEGORIES,
  VALID_STATUSES,
  VALID_PRIORITIES,
  ComplaintCategory,
  ComplaintStatus,
  Priority,
} from '../types/index.js';
import { AppError } from './errorHandler.js';

// Regex to validate complaint ID format (e.g. PUP-2026-0101 or standard alphanumeric identifier)
const COMPLAINT_ID_REGEX = /^[A-Za-z0-9_-]{3,30}$/;

export const validateComplaintId = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  if (!id || typeof id !== 'string' || !COMPLAINT_ID_REGEX.test(id.trim())) {
    return next(
      new AppError(
        `Invalid complaint ID format '${id}'. Expected format like 'PUP-2026-XXXX'.`,
        400
      )
    );
  }

  req.params.id = id.trim();
  next();
};

export const validateCreateComplaint = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { title, category, location, priority, description } = req.body;
  const errors: string[] = [];

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    errors.push('Field "title" is required and must be at least 3 characters.');
  } else if (title.trim().length > 200) {
    errors.push('Field "title" cannot exceed 200 characters.');
  }

  if (!category || !VALID_CATEGORIES.includes(category as ComplaintCategory)) {
    errors.push(
      `Field "category" must be one of: ${VALID_CATEGORIES.join(', ')}.`
    );
  }

  if (!location || typeof location !== 'string' || location.trim().length < 2) {
    errors.push('Field "location" is required and must be at least 2 characters.');
  } else if (location.trim().length > 200) {
    errors.push('Field "location" cannot exceed 200 characters.');
  }

  if (!priority || !VALID_PRIORITIES.includes(priority as Priority)) {
    errors.push(`Field "priority" must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (
    !description ||
    typeof description !== 'string' ||
    description.trim().length < 5
  ) {
    errors.push(
      'Field "description" is required and must be at least 5 characters.'
    );
  } else if (description.trim().length > 3000) {
    errors.push('Field "description" cannot exceed 3000 characters.');
  }

  if (errors.length > 0) {
    return next(new AppError('Validation failed for complaint submission.', 400, errors));
  }

  next();
};

export const validateUpdateStatus = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { status, notes, department } = req.body;
  const errors: string[] = [];

  if (!status || !VALID_STATUSES.includes(status as ComplaintStatus)) {
    errors.push(
      `Field "status" is required and must be one of: ${VALID_STATUSES.join(', ')}.`
    );
  }

  if (notes !== undefined && typeof notes !== 'string') {
    errors.push('Field "notes" must be a string if provided.');
  }

  if (department !== undefined && typeof department !== 'string') {
    errors.push('Field "department" must be a string if provided.');
  }

  if (errors.length > 0) {
    return next(
      new AppError('Validation failed for status transition.', 400, errors)
    );
  }

  next();
};

export const validateAddComment = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { message, isInternal } = req.body;
  const errors: string[] = [];

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    errors.push('Field "message" is required and cannot be empty.');
  } else if (message.trim().length > 1000) {
    errors.push('Field "message" cannot exceed 1000 characters.');
  }

  if (isInternal !== undefined && typeof isInternal !== 'boolean') {
    errors.push('Field "isInternal" must be a boolean if provided.');
  }

  if (errors.length > 0) {
    return next(new AppError('Validation failed for comment creation.', 400, errors));
  }

  next();
};

export const validatePatchComplaint = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { assignedDepartment, assignedTo, priority, isEscalated } = req.body;
  const errors: string[] = [];

  const hasAnyField =
    assignedDepartment !== undefined ||
    assignedTo !== undefined ||
    priority !== undefined ||
    isEscalated !== undefined;

  if (!hasAnyField) {
    errors.push(
      'At least one field to update must be provided (assignedDepartment, assignedTo, priority, isEscalated).'
    );
  }

  if (priority !== undefined && !VALID_PRIORITIES.includes(priority as Priority)) {
    errors.push(`Field "priority" must be one of: ${VALID_PRIORITIES.join(', ')}.`);
  }

  if (
    assignedDepartment !== undefined &&
    typeof assignedDepartment !== 'string'
  ) {
    errors.push('Field "assignedDepartment" must be a string.');
  }

  if (assignedTo !== undefined && typeof assignedTo !== 'string') {
    errors.push('Field "assignedTo" must be a string.');
  }

  if (isEscalated !== undefined && typeof isEscalated !== 'boolean') {
    errors.push('Field "isEscalated" must be a boolean.');
  }

  if (errors.length > 0) {
    return next(new AppError('Validation failed for complaint patch.', 400, errors));
  }

  next();
};

export const validateRegister = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Field "name" is required and must be at least 2 characters.');
  }

  if (
    !email ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.push('A valid "email" address is required.');
  }

  if (
    !password ||
    typeof password !== 'string' ||
    password.length < 6
  ) {
    errors.push('Field "password" is required and must be at least 6 characters.');
  }

  if (errors.length > 0) {
    return next(new AppError('Validation failed for registration.', 400, errors));
  }

  next();
};

export const validateLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.push('Field "email" is required.');
  }

  if (!password || typeof password !== 'string' || !password) {
    errors.push('Field "password" is required.');
  }

  if (errors.length > 0) {
    return next(new AppError('Validation failed for login.', 400, errors));
  }

  next();
};

export const validateDemoLogin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const { role } = req.body;
  if (!role || !['student', 'admin', 'faculty'].includes(role)) {
    return next(
      new AppError('Field "role" must be one of: student, admin, faculty.', 400)
    );
  }
  next();
};

