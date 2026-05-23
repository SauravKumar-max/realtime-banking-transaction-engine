export const TRANSACTION_TYPES = ['DEBIT', 'CREDIT'] as const;
export const TRANSACTION_STATUSES = ['PENDING', 'BLOCKED', 'COMPLETED', 'FAILED', 'FINALIZED'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];
