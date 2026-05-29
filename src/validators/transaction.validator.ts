import type { Request } from 'express';
import type { ValidationDetail } from '../types/error.types.js';
import { validationError } from '../utils/error.js';
import { TRANSACTION_TYPES, type CreateTransactionInput } from '../types/transaction.types.js';
import { requiredString } from './validator.utils.js';

export function parseTransactionInput(req: Request): CreateTransactionInput {
  const body = req.body as Record<string, unknown>;
  const errors: ValidationDetail[] = [];

  const transactionId = requiredString(body.transactionId, 'transactionId', 'Transaction ID is required.', errors);
  const accountId = requiredString(body.accountId, 'accountId', 'Account ID is required.', errors);

  let type: CreateTransactionInput['type'] = TRANSACTION_TYPES[0];
  if (typeof body.type !== 'string' || body.type.trim().length === 0) {
    errors.push({
      field: 'type',
      message: 'Transaction type is required.',
    });
  } else {
    const normalizedType = body.type.trim().toUpperCase();

    if (!TRANSACTION_TYPES.includes(normalizedType as (typeof TRANSACTION_TYPES)[number])) {
      errors.push({
        field: 'type',
        message: `Transaction type must be one of: ${TRANSACTION_TYPES.join(', ')}.`,
      });
    } else {
      type = normalizedType as (typeof TRANSACTION_TYPES)[number];
    }
  }

  let amount = 0n;
  if (typeof body.amount !== 'number') {
    errors.push({
      field: 'amount',
      message: 'Amount is required.',
    });
  } else if (!Number.isFinite(body.amount) || !Number.isSafeInteger(body.amount)) {
    errors.push({
      field: 'amount',
      message: 'Amount must be a safe interger',
    });
  } else if (body.amount <= 0) {
    errors.push({
      field: 'amount',
      message: 'Amount must be greater than zero.',
    });
  } else {
    amount = BigInt(body.amount);
  }

  let deviceFingerprint: string | undefined;
  if (body.deviceFingerprint !== undefined) {
    if (typeof body.deviceFingerprint !== 'string' || body.deviceFingerprint.trim().length === 0) {
      errors.push({
        field: 'deviceFingerprint',
        message: 'Device fingerprint must be a non-empty string when provided.',
      });
    } else {
      deviceFingerprint = body.deviceFingerprint.trim();
    }
  }

  const ipAddress = req.ip?.trim() ?? '';
  if (ipAddress.length === 0) {
    errors.push({
      field: 'ipAddress',
      message: 'IP address could not be determined.',
    });
  }

  if (errors.length > 0) {
    throw validationError('Invalid transaction data.', errors);
  }

  return {
    transactionId,
    accountId,
    type,
    amount,
    ipAddress,
    ...(deviceFingerprint !== undefined ? { deviceFingerprint } : {}),
  };
}
