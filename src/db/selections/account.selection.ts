import type { InferSelectModel } from 'drizzle-orm';
import type { PublicUser } from './user.selection.js';
import { accountsTable } from '../schema.js';

export const publicAccountColumns = {
  id: accountsTable.id,
  type: accountsTable.type,
  balance: accountsTable.balance,
  currency: accountsTable.currency,
  status: accountsTable.status,
  createdAt: accountsTable.createdAt,
};

type Account = InferSelectModel<typeof accountsTable>;
export type PublicAccount = Pick<Account, keyof typeof publicAccountColumns>;
export type PublicAccountWithUser = {
  account: PublicAccount;
  user: PublicUser;
};
