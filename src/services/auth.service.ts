import { eq, or } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { usersTable } from '../db/schema.js';
import { publicUserColumns, type PublicUser } from '../db/selections/user.selection.js';
import type { LoginCredentialsInput, RegisterUserInput } from '../types/auth.types.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { conflictError, notFoundError, unauthorizedError } from '../utils/error.js';

export async function registerUserInService(input: RegisterUserInput): Promise<PublicUser> {
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

export async function loginUserInService(credentials: LoginCredentialsInput) {
  const { type, value, password } = credentials;

  const user = await findUser(type, value);

  if (!user) {
    throw unauthorizedError('Invalid email/phone.');
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);

  if (!isPasswordValid) {
    throw unauthorizedError('Incorrect password.');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

export async function getAuthenticatedUser(userId: string): Promise<PublicUser> {
  const users = await db.select(publicUserColumns).from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  const user = users[0];
  if (!user) {
    throw notFoundError('User not found.');
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

async function findUser(type: 'EMAIL' | 'PHONE', value: string) {
  const users = await db
    .select()
    .from(usersTable)
    .where(type === 'EMAIL' ? eq(usersTable.email, value) : eq(usersTable.phone, value))
    .limit(1);

  return users[0];
}
