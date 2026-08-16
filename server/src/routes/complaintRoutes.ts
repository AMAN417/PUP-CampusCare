import { Router } from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  patchComplaint,
  updateComplaintStatus,
  addComplaintComment,
} from '../controllers/complaintController.js';
import {
  validateComplaintId,
  validateCreateComplaint,
  validatePatchComplaint,
  validateUpdateStatus,
  validateAddComment,
} from '../middleware/validator.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All complaint routes require authenticated sessions
router.use(requireAuth);

// GET /api/campuscare/complaints - Filter and list complaints (scoped by role)
router.get('/complaints', getComplaints);

// GET /api/campuscare/complaints/:id - Retrieve single complaint (scoped by role)
router.get('/complaints/:id', validateComplaintId, getComplaintById);

// POST /api/campuscare/complaints - Submit new complaint (identity derived server-side)
router.post('/complaints', validateCreateComplaint, createComplaint);

// PATCH /api/campuscare/complaints/:id - Partial update (Admin only)
router.patch(
  '/complaints/:id',
  requireAdmin,
  validateComplaintId,
  validatePatchComplaint,
  patchComplaint
);

// POST /api/campuscare/complaints/:id/status - Advance lifecycle status (Admin only)
router.post(
  '/complaints/:id/status',
  requireAdmin,
  validateComplaintId,
  validateUpdateStatus,
  updateComplaintStatus
);

// POST /api/campuscare/complaints/:id/comments - Add remark or message (Owner or Admin)
router.post(
  '/complaints/:id/comments',
  validateComplaintId,
  validateAddComment,
  addComplaintComment
);

export default router;
