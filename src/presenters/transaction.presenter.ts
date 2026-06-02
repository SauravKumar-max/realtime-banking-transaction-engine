import type { InferSelectModel } from 'drizzle-orm';
import { transactionsTable } from '../db/schema.js';

type TransactionRecord = InferSelectModel<typeof transactionsTable>;

export function buildTransactionMessage(status: TransactionRecord['status'], wasDuplicate: boolean): string {
  const statusMessage = getTransactionStatusMessage(status);

  if (wasDuplicate) {
    return `Transaction already processed. Current status: ${statusMessage}`;
  }

  return statusMessage;
}

export function serializeTransaction(transaction: TransactionRecord) {
  return {
    ...transaction,
    amount: transaction.amount.toString(),
    balanceBefore: transaction.balanceBefore?.toString() ?? null,
    balanceAfter: transaction.balanceAfter?.toString() ?? null,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

function getTransactionStatusMessage(status: TransactionRecord['status']): string {
  switch (status) {
    case 'PENDING':
      return 'Transaction accepted and pending downstream processing.';
    case 'BLOCKED':
      return 'Transaction blocked by fraud checks.';
    case 'COMPLETED':
      return 'Transaction completed successfully.';
    case 'FAILED':
      return 'Transaction failed.';
    case 'FINALIZED':
      return 'Transaction finalized successfully.';
    default: {
      const exhaustiveCheck: never = status;
      return exhaustiveCheck;
    }
  }
}
