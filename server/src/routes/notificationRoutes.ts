import { Router } from 'express';
import { getNotifications } from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/campuscare/notifications (Authenticated & Scoped)
router.get('/notifications', requireAuth, getNotifications);

export default router;
