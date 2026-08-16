import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/environment.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

export const createApp = (): Express => {
  const app = express();

  // 1. CORS Configuration
  const corsOptions: cors.CorsOptions = {
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };
  app.use(cors(corsOptions));

  // 2. Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 3. Request logger
  app.use(requestLogger);

  // 4. Mount API Routes (/api/campuscare)
  app.use(config.API_PREFIX, apiRouter);

  // Root welcome route
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'Punjabi University Patiala - PUP CampusCare REST API Service',
      documentation: `${config.API_PREFIX}/health`,
      timestamp: new Date().toISOString(),
    });
  });

  // 5. 404 handler
  app.use(notFoundHandler);

  // 6. Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
