import type { InferSelectModel } from 'drizzle-orm';
import { usersTable } from '../schema.js';

export const publicUserColumns = {
  id: usersTable.id,
  name: usersTable.name,
  email: usersTable.email,
  phone: usersTable.phone,
  createdAt: usersTable.createdAt,
};

type User = InferSelectModel<typeof usersTable>;
export type PublicUser = Pick<User, keyof typeof publicUserColumns>;
