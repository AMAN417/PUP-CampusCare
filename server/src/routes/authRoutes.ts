import { Router } from 'express';
import {
  register,
  login,
  demoLogin,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import {
  validateRegister,
  validateLogin,
  validateDemoLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../middleware/validator.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/campuscare/auth/register - Register new student account (immediate access, forced student role)
router.post('/auth/register', validateRegister, register);

// POST /api/campuscare/auth/login - Authenticate with email & password
router.post('/auth/login', validateLogin, login);

// POST /api/campuscare/auth/forgot-password - Request recovery link for password reset
router.post('/auth/forgot-password', validateForgotPassword, forgotPassword);

// POST /api/campuscare/auth/reset-password - Reset password using recovery session / token
router.post('/auth/reset-password', validateResetPassword, resetPassword);

// POST /api/campuscare/auth/demo-login - Instant 1-click demo login (test suite & development)
router.post('/auth/demo-login', validateDemoLogin, demoLogin);

// GET /api/campuscare/auth/me - Retrieve current authenticated profile
router.get('/auth/me', requireAuth, getMe);

// POST /api/campuscare/auth/logout - Sign out session
router.post('/auth/logout', logout);

export default router;

