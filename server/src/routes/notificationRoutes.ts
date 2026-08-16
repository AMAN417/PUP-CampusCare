import { Router } from 'express';
import { getNotifications } from '../controllers/notificationController.js';

const router = Router();

// GET /api/campuscare/notifications
router.get('/notifications', getNotifications);

export default router;
