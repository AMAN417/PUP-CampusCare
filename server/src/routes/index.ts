import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use(authRoutes);
apiRouter.use(complaintRoutes);
apiRouter.use(notificationRoutes);

export default apiRouter;
