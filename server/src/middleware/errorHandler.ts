import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/index.js';
import { config } from '../config/environment.js';

export class AppError extends Error {
  public statusCode: number;
  public errors?: string[];

  constructor(message: string, statusCode: number = 500, errors?: string[]) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  };
  res.status(404).json(response);
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const errors = 'errors' in err ? err.errors : undefined;

  // Mask internal error details in production unless explicitly an AppError
  const message =
    config.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal Server Error';

  const response: ApiResponse = {
    success: false,
    error: message,
    errors: errors && errors.length > 0 ? errors : undefined,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
};
