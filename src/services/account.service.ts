import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { accountsTable, usersTable } from '../db/schema.js';
import {
  publicAccountColumns,
  type PublicAccountWithUser,
} from '../db/selections/account.selection.js';
import { publicUserColumns } from '../db/selections/user.selection.js';
import type { CreateAccountInput } from '../types/account.types.js';
import { unauthorizedError } from '../utils/error.js';

export async function createAccountInService(
  input: CreateAccountInput,
  userId?: string
): Promise<PublicAccountWithUser> {
  const { type } = input;   

  if (!userId) {
    throw unauthorizedError();
  }

  const accounts = await db.insert(accountsTable).values({ type, userId }).returning({
    id: accountsTable.id,
  });
  const createdAccount = accounts[0];

  if (!createdAccount) {
    throw new Error('Account insert returned no record.');
  }

  const accountDetails = await db
    .select({
      account: publicAccountColumns,
      user: publicUserColumns,
    })
    .from(accountsTable)
    .innerJoin(usersTable, eq(accountsTable.userId, usersTable.id))
    .where(eq(accountsTable.id, createdAccount.id))
    .limit(1);

  const accountWithUser = accountDetails[0];

  if (!accountWithUser) {
    throw new Error('Created account details could not be loaded.');
  }

  return accountWithUser;
}

export async function getAccountByAccountId(accountId: string) {
  const account =  await db.select().from(accountsTable).where(eq(accountsTable.id, accountId)).limit(1);
  return account[0];
}