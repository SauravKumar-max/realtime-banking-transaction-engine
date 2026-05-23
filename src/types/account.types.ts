export const ACCOUNT_TYPES = ['SAVINGS', 'CURRENT'] as const;
export const ACCOUNT_STATUSES = ['ACTIVE', 'BLOCKED', 'FROZEN', 'CLOSED'] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export type CreateAccountInput = {
  type: AccountType;
};
