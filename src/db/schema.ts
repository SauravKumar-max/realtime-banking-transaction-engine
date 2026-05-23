import { sql } from 'drizzle-orm';
import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { ACCOUNT_STATUSES, ACCOUNT_TYPES } from '../types/account.types.js';
import { TRANSACTION_STATUSES, TRANSACTION_TYPES } from '../types/transaction.types.js';

export const accountTypeEnum = pgEnum('account_type', ACCOUNT_TYPES);
export const accountStatusEnum = pgEnum('account_status', ACCOUNT_STATUSES);
export const transactionTypeEnum = pgEnum('transaction_type', TRANSACTION_TYPES);
export const transactionStatusEnum = pgEnum('transaction_status', TRANSACTION_STATUSES);

export const usersTable = pgTable('users', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 15 }).notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const accountsTable = pgTable('accounts', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  type: accountTypeEnum().notNull(),
  balance: integer().notNull().default(0),
  currency: varchar({ length: 3 }).notNull().default('INR'),
  status: accountStatusEnum().notNull().default('ACTIVE'),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const transactionsTable = pgTable('transactions', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  accountId: uuid()
    .notNull()
    .references(() => accountsTable.id),
  type: transactionTypeEnum().notNull(),
  amount: integer().notNull(),
  status: transactionStatusEnum().notNull(),
  isFraud: boolean().default(false),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
