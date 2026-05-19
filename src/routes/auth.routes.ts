import { Router } from 'express';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/require-auth.middleware.js';
import { requireObjectBody } from '../middlewares/require-object-body.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/register', requireObjectBody, asyncHandler(registerUser));
router.post('/login', requireObjectBody, asyncHandler(loginUser));
router.get('/me', requireAuth, asyncHandler(getCurrentUser));
router.post('/logout', requireAuth, asyncHandler(logoutUser));

export default router;
