import { sql } from 'drizzle-orm';
import { bigint, boolean, inet, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { ACCOUNT_STATUSES, ACCOUNT_TYPES } from '../types/account.types.js';
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../types/transaction.types.js';

export const accountTypeEnum = pgEnum('account_type', ACCOUNT_TYPES);
export const accountStatusEnum = pgEnum('account_status', ACCOUNT_STATUSES);
export const transactionTypeEnum = pgEnum('transaction_type', TRANSACTION_TYPES);
export const transactionStatusEnum = pgEnum('transaction_status', TRANSACTION_STATUSES);

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
  balance: bigint('balance', { mode: 'bigint' }).notNull().default(sql`0`),
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  status: accountStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const transactionsTable = pgTable('transactions', {
  id: uuid('id')
    .primaryKey()
    .default(sql`uuidv7()`),
  accountId: uuid('account_id')
    .notNull()
    .references(() => accountsTable.id),
  type: transactionTypeEnum('type').notNull(),
  transactionId: text('transaction_id').unique().notNull(),
  amount: bigint('amount', { mode: 'bigint' }).notNull(),
  status: transactionStatusEnum('status').notNull(),
  isFraud: boolean('is_fraud').default(false),
  ipAddress: inet('ip_address').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
