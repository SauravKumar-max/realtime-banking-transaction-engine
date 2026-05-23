import { Router } from 'express';
import { createAccount } from '../controllers/account.controller.js';
import { requireAuth } from '../middlewares/require-auth.middleware.js';
import { requireObjectBody } from '../middlewares/require-object-body.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.post('/create', requireAuth, requireObjectBody, asyncHandler(createAccount));

export default router;
