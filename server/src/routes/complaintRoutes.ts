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

const router = Router();

// GET /api/campuscare/complaints - Filter and list complaints
router.get('/complaints', getComplaints);

// GET /api/campuscare/complaints/:id - Retrieve single complaint
router.get('/complaints/:id', validateComplaintId, getComplaintById);

// POST /api/campuscare/complaints - Submit new complaint
router.post('/complaints', validateCreateComplaint, createComplaint);

// PATCH /api/campuscare/complaints/:id - Partial update
router.patch(
  '/complaints/:id',
  validateComplaintId,
  validatePatchComplaint,
  patchComplaint
);

// POST /api/campuscare/complaints/:id/status - Advance lifecycle status
router.post(
  '/complaints/:id/status',
  validateComplaintId,
  validateUpdateStatus,
  updateComplaintStatus
);

// POST /api/campuscare/complaints/:id/comments - Add remark or message
router.post(
  '/complaints/:id/comments',
  validateComplaintId,
  validateAddComment,
  addComplaintComment
);

export default router;
