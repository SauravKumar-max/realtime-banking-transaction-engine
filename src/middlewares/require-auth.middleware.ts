import type { NextFunction, Request, Response } from 'express';
import { unauthorizedError } from '../utils/error.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return next(unauthorizedError('Authentication required.'));
  }

  next();
}
