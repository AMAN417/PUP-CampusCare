import { Request, Response } from 'express';
import { ApiResponse } from '../types/index.js';
import { config } from '../config/environment.js';

export const getHealth = (_req: Request, res: Response): void => {
  const response: ApiResponse<{
    status: string;
    version: string;
    environment: string;
    uptimeSeconds: number;
  }> = {
    success: true,
    message: 'PUP CampusCare REST API is running and operational.',
    data: {
      status: 'UP',
      version: '1.0.0',
      environment: config.NODE_ENV,
      uptimeSeconds: Math.floor(process.uptime()),
    },
    timestamp: new Date().toISOString(),
  };

  res.status(200).json(response);
};
