import type { AppError } from '../types/error.types.js';

export function validationError(message: string, details?: unknown): AppError {
  return {
    type: 'validation_error',
    statusCode: 400,
    message,
    details,
  };
}

export function conflictError(message: string, details?: unknown): AppError {
  return {
    type: 'conflict_error',
    statusCode: 409,
    message,
    details,
  };
}

export function unauthorizedError(message = 'Unauthorized'): AppError {
  return {
    type: 'unauthorized_error',
    statusCode: 401,
    message,
  };
}

export function notFoundError(message = 'Not Found'): AppError {
  return {
    type: 'not_found_error',
    statusCode: 404,
    message,
  };
}
