import type { ValidationDetail } from '../types/error.types.js';

export function requiredString(value: unknown, field: string, message: string, errors: ValidationDetail[]): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push({
      field,
      message,
    });

    return '';
  }

  return value.trim();
}
