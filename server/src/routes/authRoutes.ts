import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  getMe,
  logout,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateDemoLogin,
} from '../middleware/validator.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/campuscare/auth/register - Register new student account
router.post('/auth/register', validateRegister, register);

// POST /api/campuscare/auth/login - Authenticate with email & password
router.post('/auth/login', validateLogin, login);

// POST /api/campuscare/auth/demo-login - Instant 1-click demo login
router.post('/auth/demo-login', validateDemoLogin, demoLogin);

// GET /api/campuscare/auth/me - Retrieve current verified profile
router.get('/auth/me', requireAuth, getMe);

// POST /api/campuscare/auth/logout - Sign out session
router.post('/auth/logout', logout);

export default router;
