import { Router } from 'express';
import { registerUser } from '../controllers/auth.controller.js';
import { requireObjectBody } from '../middlewares/require-object-body.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/register', requireObjectBody, asyncHandler(registerUser));

export default router;
