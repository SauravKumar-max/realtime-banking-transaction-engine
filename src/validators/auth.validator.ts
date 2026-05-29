import type { LoginCredentialsInput, RegisterUserInput } from '../types/auth.types.js';
import type { ValidationDetail } from '../types/error.types.js';

import { validationError } from '../utils/error.js';
import { requiredString } from './validator.utils.js';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const PHONE_REGEX = /^\d{10,15}$/;

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;

export function parseRegisterUserInput(body: Record<string, unknown>): RegisterUserInput {
  const errors: ValidationDetail[] = [];

  const name = requiredString(body.name, 'name', 'Name is required.', errors);
  const email = requiredString(body.email, 'email', 'Email is required.', errors);
  const phone = requiredString(body.phone, 'phone', 'Phone is required.', errors);
  const password = requiredString(body.password, 'password', 'Password is required.', errors);

  const validatedName = validateName(name, errors);
  const validatedEmail = validateEmail(email, errors);
  const validatedPhone = validatePhone(phone, errors);
  const validatedPassword = validatePassword(password, errors);

  if (errors.length > 0) {
    throw validationError('Invalid registration data.', errors);
  }

  return {
    name: validatedName,
    email: validatedEmail,
    phone: validatedPhone,
    password: validatedPassword,
  };
}

export function parseUserCredentials(body: Record<string, unknown>): LoginCredentialsInput {
  const errors: ValidationDetail[] = [];

  const hasEmail = typeof body.email === 'string' && body.email.trim().length > 0;
  const hasPhone = typeof body.phone === 'string' && body.phone.trim().length > 0;

  if (!hasEmail && !hasPhone) {
    errors.push({
      field: 'identifier',
      message: 'Either email or phone is required.',
    });
  }

  if (hasEmail && hasPhone) {
    errors.push({
      field: 'identifier',
      message: 'Provide either email or phone, not both.',
    });
  }

  const password = requiredString(body.password, 'password', 'Password is required.', errors);

  let type: 'EMAIL' | 'PHONE' = 'EMAIL';
  let value = '';

  if (hasEmail) {
    type = 'EMAIL';
    value = validateEmail(body.email as string, errors);
  }

  if (hasPhone) {
    type = 'PHONE';
    value = validatePhone(body.phone as string, errors);
  }

  if (errors.length > 0) {
    throw validationError('Invalid login credentials.', errors);
  }

  return {
    type,
    value,
    password,
  };
}

function validateName(value: string, errors: ValidationDetail[]): string {
  const name = value.trim().replace(/\s+/g, ' ');

  if (name.length < MIN_NAME_LENGTH) {
    errors.push({
      field: 'name',
      message: `Name must be at least ${MIN_NAME_LENGTH} characters long.`,
    });
  }

  if (name.length > MAX_NAME_LENGTH) {
    errors.push({
      field: 'name',
      message: `Name must not exceed ${MAX_NAME_LENGTH} characters.`,
    });
  }

  return name;
}

function validateEmail(value: string, errors: ValidationDetail[]): string {
  const email = value.trim().toLowerCase();

  if (email.length > MAX_EMAIL_LENGTH) {
    errors.push({
      field: 'email',
      message: `Email must not exceed ${MAX_EMAIL_LENGTH} characters.`,
    });
  }

  if (!EMAIL_REGEX.test(email)) {
    errors.push({
      field: 'email',
      message: 'Email format is invalid.',
    });
  }

  return email;
}

function validatePhone(value: string, errors: ValidationDetail[]): string {
  const phone = value.replace(/\D/g, '');

  if (!PHONE_REGEX.test(phone)) {
    errors.push({
      field: 'phone',
      message: 'Phone must contain 10 to 15 digits.',
    });
  }

  return phone;
}

function validatePassword(value: string, errors: ValidationDetail[]): string {
  const password = value.trim();

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    });
  }

  return password;
}
