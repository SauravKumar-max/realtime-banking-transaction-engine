import type { CreateAccountInput } from '../types/account.types.js';
import type { ValidationDetail } from '../types/error.types.js';

import { ACCOUNT_TYPES } from '../types/account.types.js';
import { validationError } from '../utils/error.js';

export function parseCreateAccountInput(body: Record<string, unknown>): CreateAccountInput {
  const errors: ValidationDetail[] = [];

  let type: CreateAccountInput['type'] = ACCOUNT_TYPES[0];

  if (typeof body.type !== 'string') {
    errors.push({
      field: 'type',
      message: 'Account type is required.',
    });
  } else {
    const normalizedType = body.type.trim().toUpperCase();

    if (!ACCOUNT_TYPES.includes(normalizedType as CreateAccountInput['type'])) {
      errors.push({
        field: 'type',
        message: `Account type must be one of: ${ACCOUNT_TYPES.join(', ')}.`,
      });
    } else {
      type = normalizedType as CreateAccountInput['type'];
    }
  }

  if (errors.length > 0) {
    throw validationError('Invalid account data.', errors);
  }

  return { type };
}