import { argon2id, hash } from 'argon2';

const PASSWORD_HASH_OPTIONS = {
  type: argon2id,
} as const;

export function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_HASH_OPTIONS);
}
