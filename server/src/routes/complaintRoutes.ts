import { Router } from 'express';
import {
  getComplaints,
  getComplaintById,
  createComplaint,
  patchComplaint,
  deleteComplaint,
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

// PATCH /api/campuscare/complaints/:id - Partial update
// Students can edit their own complaint (title, description, category, priority, location)
// Admins can also update assignment fields
// Ownership and field whitelisting enforced in controller
router.patch(
  '/complaints/:id',
  validateComplaintId,
  validatePatchComplaint,
  patchComplaint
);

// DELETE /api/campuscare/complaints/:id - Delete complaint (ADMIN ONLY)
// Defense layer 1: requireAdmin rejects students with 403 and anonymous
// requests with 401 before the controller runs. The controller and service
// re-verify the admin role server-side (zero-trust, no frontend flags).
router.delete(
  '/complaints/:id',
  requireAuth,
  validateComplaintId,
  requireAdmin,
  deleteComplaint
);

// POST /api/campuscare/complaints/:id/status - Advance lifecycle status
// Admins may apply any valid transition; a student may ONLY confirm & close
// their own Resolved complaint. Authorization enforced in controller.
router.post(
  '/complaints/:id/status',
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
