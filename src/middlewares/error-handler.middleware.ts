import type { Request, Response, NextFunction } from 'express';
import type { AppError } from '../types/error.types.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(error: AppError, req: Request, res: Response, _next: NextFunction) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({
      message: error.message,
      errors: error.details,
    });
  }

  console.error(error);

  return res.status(500).json({
    message: 'Internal Server Error',
  });
}
