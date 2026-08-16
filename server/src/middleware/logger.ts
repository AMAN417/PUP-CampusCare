import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    const statusCode = res.statusCode;

    // Optional simple colorized log formatting
    const color =
      statusCode >= 500
        ? '\x1b[31m' // red
        : statusCode >= 400
        ? '\x1b[33m' // yellow
        : statusCode >= 300
        ? '\x1b[36m' // cyan
        : '\x1b[32m'; // green
    const reset = '\x1b[0m';

    console.log(
      `[${timestamp}] ${req.method} ${req.originalUrl} ${color}${statusCode}${reset} - ${duration}ms`
    );
  });

  next();
};
