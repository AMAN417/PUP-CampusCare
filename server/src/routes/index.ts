import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import complaintRoutes from './complaintRoutes.js';
import notificationRoutes from './notificationRoutes.js';

const apiRouter = Router();

apiRouter.use(healthRoutes);
apiRouter.use(complaintRoutes);
apiRouter.use(notificationRoutes);

export default apiRouter;
