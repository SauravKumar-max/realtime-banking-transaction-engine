import type { Request, Response } from 'express';
import type { AppError } from '../types/error.types.js';

export function errorHandler(error: AppError, req: Request, res: Response) {
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
