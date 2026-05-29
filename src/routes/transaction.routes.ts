import { Router } from 'express';
import { requireAuth } from '../middlewares/require-auth.middleware.js';
import { requireObjectBody } from '../middlewares/require-object-body.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import { createTransaction } from '../controllers/transaction.controller.js';

const router = Router();

router.post('/', requireAuth, requireObjectBody, asyncHandler(createTransaction));

export default router;
