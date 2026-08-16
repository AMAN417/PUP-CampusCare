import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService.js';
import { ApiResponse, AuthResponseData, User } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      message: `Account created successfully for ${result.user.name}.`,
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      message: `Welcome back, ${result.user.name}!`,
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const demoLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const role = req.body.role || 'student';
    const result = await authService.demoLogin(role);

    const response: ApiResponse<AuthResponseData> = {
      success: true,
      message: `Authenticated as demo ${role} (${result.user.name}).`,
      data: result,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Not authenticated.', 401);
    }

    const response: ApiResponse<{ user: User }> = {
      success: true,
      data: { user: req.user },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response: ApiResponse<{ message: string }> = {
      success: true,
      message: 'Signed out successfully.',
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
