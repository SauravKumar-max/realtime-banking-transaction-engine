export const TRANSACTION_TYPES = ['DEBIT', 'CREDIT'] as const;
export const TRANSACTION_STATUSES = ['PENDING', 'BLOCKED', 'COMPLETED', 'FAILED', 'FINALIZED'] as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[number];
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export type CreateTransactionRequestBody = {
  transactionId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  deviceFingerprint?: string;
};

export type CreateTransactionInput = {
  transactionId: string;
  accountId: string;
  type: TransactionType;
  amount: bigint;
  ipAddress: string;
  deviceFingerprint?: string;
};
