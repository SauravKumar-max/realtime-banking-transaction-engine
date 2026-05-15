import { eq, or } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { usersTable } from '../db/schema.js';
import { publicUserColumns, type PublicUser } from '../db/selections/user.selection.js';
import type { RegisterUserInput } from '../types/auth.types.js';
import { hashPassword } from '../utils/password.js';
import { conflictError } from '../utils/error.js';

export async function registerUser(input: RegisterUserInput): Promise<PublicUser> {
  const { name, email, phone, password } = input;

  const existingUser = await findUserByEmailOrPhone(email, phone);

  if (existingUser) {
    const duplicateField = existingUser.email === email ? 'email' : 'phone';

    throw conflictError(`A user with this ${duplicateField} already exists.`, [
      {
        field: duplicateField,
        message: `This ${duplicateField} is already in use.`,
      },
    ]);
  }

  const passwordHash = await hashPassword(password);

  const users = await db
    .insert(usersTable)
    .values({
      name,
      email,
      phone,
      passwordHash,
    })
    .returning(publicUserColumns);

  const user = users[0];

  if (!user) {
    throw new Error('User insert returned no record.');
  }

  return user;
}

async function findUserByEmailOrPhone(email: string, phone: string) {
  const users = await db
    .select({
      email: usersTable.email,
      phone: usersTable.phone,
    })
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.phone, phone)))
    .limit(1);

  return users[0];
}
