import { sql } from 'drizzle-orm';
import { boolean, integer, pgTable, text, uuid, varchar } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phone: varchar({ length: 15 }).notNull().unique(),
  passwordHash: text().notNull(),
  updatedAt: integer().notNull().default(Date.now()),
  createdAt: integer().notNull().default(Date.now()),
});

export const accountsTable = pgTable('accounts', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  type: varchar({ length: 20 }).notNull(),
  balance: integer().notNull().default(0),
  currency: varchar({ length: 3 }).notNull().default('INR'),
  status: varchar({ length: 20 }).notNull().default('ACTIVE'),
  updatedAt: integer().notNull().default(Date.now()),
  createdAt: integer().notNull().default(Date.now()),
});

export const transactionsTable = pgTable('transactions', {
  id: uuid()
    .primaryKey()
    .default(sql`uuidv7()`),
  accountId: uuid()
    .notNull()
    .references(() => accountsTable.id),
  type: varchar({ length: 10 }).notNull(),
  amount: integer().notNull(),
  status: varchar({ length: 20 }).notNull(),
  isFraud: boolean().default(false),
  updatedAt: integer().notNull().default(Date.now()),
  createdAt: integer().notNull().default(Date.now()),
});
