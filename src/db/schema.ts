import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  index,
  inet,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { ACCOUNT_STATUSES, ACCOUNT_TYPES } from '../types/account.types.js';
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../types/transaction.types.js';

export const accountTypeEnum = pgEnum('account_type', ACCOUNT_TYPES);
export const accountStatusEnum = pgEnum('account_status', ACCOUNT_STATUSES);
export const transactionTypeEnum = pgEnum('transaction_type', TRANSACTION_TYPES);
export const transactionStatusEnum = pgEnum('transaction_status', TRANSACTION_STATUSES);
export const outboxEventStatusEnum = pgEnum('outbox_event_status', ['PENDING', 'PUBLISHED', 'FAILED', 'DEAD_LETTER']);

export const usersTable = pgTable('users', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 15 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const accountsTable = pgTable('accounts', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id),
  type: accountTypeEnum('type').notNull(),
  balance: bigint('balance', { mode: 'bigint' })
    .notNull()
    .default(sql`0`),
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  status: accountStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transactionsTable = pgTable(
  'transactions',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accountsTable.id),
    type: transactionTypeEnum('type').notNull(),
    transactionId: text('transaction_id').notNull(),
    balanceBefore: bigint('balance_before', { mode: 'bigint' }),
    amount: bigint('amount', { mode: 'bigint' }).notNull(),
    balanceAfter: bigint('balance_after', { mode: 'bigint' }),
    status: transactionStatusEnum('status').notNull(),
    isFraud: boolean('is_fraud').notNull().default(false),
    blockedReason: text('blocked_reason'),
    failureReason: text('failure_reason'),
    correlationId: text('correlation_id').notNull(),
    deviceFingerprint: text('device_fingerprint'),
    ipAddress: inet('ip_address').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    transactionsAccountIdTransactionIdUnique: unique('transactions_account_id_transaction_id_unique').on(
      table.accountId,
      table.transactionId,
    ),
    transactionsCorrelationIdIdx: index('transactions_correlation_id_idx').on(table.correlationId),
  }),
);

export const outboxEventsTable = pgTable(
  'outbox_events',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`uuidv7()`),
    eventType: text('event_type').notNull(),
    eventVersion: integer('event_version').notNull().default(1),
    aggregateType: text('aggregate_type').notNull(),
    aggregateId: uuid('aggregate_id')
      .notNull()
      .references(() => transactionsTable.id),
    transactionId: text('transaction_id').notNull(),
    correlationId: text('correlation_id').notNull(),
    payload: jsonb('payload').notNull(),
    status: outboxEventStatusEnum('status').notNull().default('PENDING'),
    retryCount: integer('retry_count').notNull().default(0),
    availableAt: timestamp('available_at', { withTimezone: true }).defaultNow().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    lastError: text('last_error'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    outboxEventsStatusAvailableAtIdx: index('outbox_events_status_available_at_idx').on(
      table.status,
      table.availableAt,
    ),
    outboxEventsCorrelationIdIdx: index('outbox_events_correlation_id_idx').on(table.correlationId),
    outboxEventsTransactionIdIdx: index('outbox_events_transaction_id_idx').on(table.transactionId),
  }),
);
