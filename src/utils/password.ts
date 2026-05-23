import { argon2id, hash, verify } from 'argon2';

const PASSWORD_HASH_OPTIONS = {
  type: argon2id,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_HASH_OPTIONS);
}

export function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  return verify(passwordHash, password);
}
