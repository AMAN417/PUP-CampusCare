import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { AppError } from './errorHandler.js';
import { UserRole } from '../types/index.js';

/**
 * Middleware: Verifies the Bearer token server-side and attaches req.user
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('Authentication required. Please provide a valid Bearer token in the Authorization header.', 401)
      );
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return next(new AppError('Authentication token is missing.', 401));
    }

    const user = await authService.verifyToken(token);

    if (!user) {
      return next(new AppError('Invalid or expired authentication session. Please sign in again.', 401));
    }

    if (user.status === 'Inactive') {
      return next(new AppError('Account is currently deactivated. Please contact campus administration.', 403));
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware: Enforces that the authenticated user has the 'admin' role
 */
export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AppError('Authentication required before checking permissions.', 401));
  }

  if (req.user.role !== 'admin') {
    return next(
      new AppError('Access denied: Administrator privileges required for this action.', 403)
    );
  }

  next();
};

/**
 * Middleware: Enforces that the authenticated user has one of the allowed roles
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied: Required role (${allowedRoles.join(' or ')}) not granted.`,
          403
        )
      );
    }

    next();
  };
};
