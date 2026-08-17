import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/campuscare/notifications — Retrieve notifications scoped to authenticated user
router.get('/notifications', requireAuth, getNotifications);

// PATCH /api/campuscare/notifications/read-all — Mark all user notifications as read
// NOTE: This route MUST be defined before /:id to avoid "read-all" being parsed as an id
router.patch('/notifications/read-all', requireAuth, markAllNotificationsRead);

// PATCH /api/campuscare/notifications/:id/read — Mark a single notification as read
router.patch('/notifications/:id/read', requireAuth, markNotificationRead);

export default router;
