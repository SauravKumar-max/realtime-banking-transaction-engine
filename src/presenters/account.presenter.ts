import type { PublicAccountWithUser } from '../db/selections/account.selection.js';

export function serializeAccountWithUser(accountWithUser: PublicAccountWithUser) {
  return {
    account: {
      ...accountWithUser.account,
      balance: accountWithUser.account.balance.toString(),
      createdAt: accountWithUser.account.createdAt.toISOString(),
    },
    user: {
      ...accountWithUser.user,
      createdAt: accountWithUser.user.createdAt.toISOString(),
    },
  };
}
