import { and, eq, gte, type InferSelectModel } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { accountsTable, outboxEventsTable, transactionsTable } from '../db/schema.js';
import type { CreateTransactionInput } from '../types/transaction.types.js';
import { conflictError, notFoundError, unauthorizedError, validationError } from '../utils/error.js';

const MAX_SYNC_FRAUD_AMOUNT = 50_000n;
const MAX_RECENT_TRANSACTIONS_IN_WINDOW = 5;
const SYNC_FRAUD_WINDOW_MS = 60_000;

type StoredTransaction = InferSelectModel<typeof transactionsTable>;
type TransactionServiceResult = {
  transaction: StoredTransaction;
  wasDuplicate: boolean;
};

export async function createTransactionInService(
  input: CreateTransactionInput,
  userId: string | undefined
): Promise<TransactionServiceResult> {
  if (!userId) {
    throw unauthorizedError();
  }

  return db.transaction(async (tn) => {
    const lockedAccounts = await tn
      .select({
        id: accountsTable.id,
        userId: accountsTable.userId,
        balance: accountsTable.balance,
        status: accountsTable.status,
        currency: accountsTable.currency,
      })
      .from(accountsTable)
      .where(eq(accountsTable.id, input.accountId))
      .for('update')
      .limit(1);
    const lockedAccount = lockedAccounts[0];

    if (!lockedAccount) {
      throw notFoundError('Account not found.');
    }

    if (lockedAccount.userId !== userId) {
      throw unauthorizedError('You do not have access to this account.');
    }

    const existingTransactions = await tn
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.accountId, input.accountId),
          eq(transactionsTable.transactionId, input.transactionId)
        )
      )
      .limit(1);
    const existingTransaction = existingTransactions[0];

    if (existingTransaction) {
      ensureIdempotentRequestMatches(existingTransaction, input);
      return {
        transaction: existingTransaction,
        wasDuplicate: true,
      };
    }

    if (lockedAccount.status !== 'ACTIVE') {
      throw validationError('Cannot process transaction. Account is inactive.');
    }

    const balanceBefore = lockedAccount.balance;
    const recentTransactions = await tn
      .select({ id: transactionsTable.id })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.accountId, input.accountId),
          gte(transactionsTable.createdAt, new Date(Date.now() - SYNC_FRAUD_WINDOW_MS))
        )
      )
      .limit(MAX_RECENT_TRANSACTIONS_IN_WINDOW);

    const blockedReason = buildFraudBlockedReason(input.amount, recentTransactions.length);

    if (!blockedReason && input.type === 'DEBIT' && balanceBefore < input.amount) {
      throw validationError('Transaction failed. Insufficient balance.');
    }

    const balanceAfter = blockedReason
      ? balanceBefore
      : calculateBalanceAfter(balanceBefore, input.type, input.amount);
    const transactionStatus = blockedReason ? 'BLOCKED' : 'COMPLETED';

    const insertedTransactions = await tn
      .insert(transactionsTable)
      .values({
        accountId: input.accountId,
        type: input.type,
        transactionId: input.transactionId,
        balanceBefore,
        amount: input.amount,
        balanceAfter,
        status: transactionStatus,
        isFraud: Boolean(blockedReason),
        blockedReason,
        failureReason: null,
        correlationId: input.transactionId,
        deviceFingerprint: input.deviceFingerprint,
        ipAddress: input.ipAddress,
      })
      .onConflictDoNothing({
        target: [transactionsTable.accountId, transactionsTable.transactionId],
      })
      .returning();

    const createdTransaction = insertedTransactions[0];

    if (!createdTransaction) {
      const duplicateTransactions = await tn
        .select()
        .from(transactionsTable)
        .where(
          and(
            eq(transactionsTable.accountId, input.accountId),
            eq(transactionsTable.transactionId, input.transactionId)
          )
        )
        .limit(1);
      const duplicateTransaction = duplicateTransactions[0];

      if (!duplicateTransaction) {
        throw new Error('Transaction id conflict occurred, but the existing record could not be loaded.');
      }

      ensureIdempotentRequestMatches(duplicateTransaction, input);

      return {
        transaction: duplicateTransaction,
        wasDuplicate: true,
      };
    }

    if (!blockedReason) {
      await tn
        .update(accountsTable)
        .set({
          balance: balanceAfter,
          updatedAt: new Date(),
        })
        .where(eq(accountsTable.id, input.accountId));
    }

    await tn.insert(outboxEventsTable).values({
      eventType: blockedReason ? 'TransactionBlocked' : 'TransactionCompleted',
      eventVersion: 1,
      aggregateType: 'transaction',
      aggregateId: createdTransaction.id,
      transactionId: createdTransaction.transactionId,
      correlationId: createdTransaction.correlationId,
      payload: buildOutboxPayload(createdTransaction, lockedAccount.currency),
    });

    return {
      transaction: createdTransaction,
      wasDuplicate: false,
    };
  });
}

function ensureIdempotentRequestMatches(existingTransaction: StoredTransaction, input: CreateTransactionInput) {
  if (
    existingTransaction.accountId !== input.accountId ||
    existingTransaction.type !== input.type ||
    existingTransaction.amount !== input.amount
  ) {
    throw conflictError('transactionId has already been used for a different transaction request.');
  }
}

function buildFraudBlockedReason(amount: bigint, recentTransactionCount: number): string | null {
  const reasons: string[] = [];

  if (amount > MAX_SYNC_FRAUD_AMOUNT) {
    reasons.push('amount_above_sync_limit');
  }

  if (recentTransactionCount >= MAX_RECENT_TRANSACTIONS_IN_WINDOW) {
    reasons.push('too_many_transactions_in_60_seconds');
  }

  return reasons.length > 0 ? reasons.join(',') : null;
}

function calculateBalanceAfter(balanceBefore: bigint, type: CreateTransactionInput['type'], amount: bigint): bigint {
  if (type === 'CREDIT') {
    return balanceBefore + amount;
  }

  return balanceBefore - amount;
}

function buildOutboxPayload(transaction: StoredTransaction, currency: string) {
  return {
    event_type: transaction.status === 'BLOCKED' ? 'TransactionBlocked' : 'TransactionCompleted',
    event_version: 1,
    transaction_id: transaction.transactionId,
    correlation_id: transaction.correlationId,
    account_id: transaction.accountId,
    type: transaction.type,
    amount: transaction.amount.toString(),
    balance_before: transaction.balanceBefore?.toString() ?? null,
    balance_after: transaction.balanceAfter?.toString() ?? null,
    status: transaction.status,
    is_fraud: transaction.isFraud,
    blocked_reason: transaction.blockedReason,
    currency,
  };
}
