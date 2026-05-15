import type { RegisterUserInput } from '../types/auth.types.js';

import { validationError } from '../utils/error.js';

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const PHONE_REGEX = /^\d{10,15}$/;

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 255;
const MAX_EMAIL_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;

type ValidationDetail = {
  field: string;
  message: string;
};

export function parseRegisterUserInput(body: Record<string, unknown>): RegisterUserInput {
  const errors: ValidationDetail[] = [];

  const name = validateName(body.name, errors);
  const email = validateEmail(body.email, errors);
  const phone = validatePhone(body.phone, errors);
  const password = validatePassword(body.password, errors);

  if (errors.length > 0) {
    throw validationError('Invalid registration data.', errors);
  }

  return {
    name,
    email,
    phone,
    password,
  };
}

function validateName(value: unknown, errors: ValidationDetail[]): string {
  if (typeof value !== 'string') {
    errors.push({
      field: 'name',
      message: 'Name is required.',
    });
    return '';
  }

  const name = value.trim().replace(/\s+/g, ' ');

  if (name.length === 0) {
    errors.push({
      field: 'name',
      message: 'Name is required.',
    });
  }

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

function validateEmail(value: unknown, errors: ValidationDetail[]): string {
  if (typeof value !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email is required.',
    });

    return '';
  }

  const email = value.trim().toLowerCase();

  if (email.length === 0) {
    errors.push({
      field: 'email',
      message: 'Email is required.',
    });
  }

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

function validatePhone(value: unknown, errors: ValidationDetail[]): string {
  if (typeof value !== 'string') {
    errors.push({
      field: 'phone',
      message: 'Phone is required.',
    });

    return '';
  }

  const phone = value.replace(/\D/g, '');

  if (phone.length === 0) {
    errors.push({
      field: 'phone',
      message: 'Phone is required.',
    });
  }

  if (!PHONE_REGEX.test(phone)) {
    errors.push({
      field: 'phone',
      message: 'Phone must contain 10 to 15 digits.',
    });
  }

  return phone;
}

function validatePassword(value: unknown, errors: ValidationDetail[]): string {
  if (typeof value !== 'string') {
    errors.push({
      field: 'password',
      message: 'Password is required.',
    });

    return '';
  }

  const password = value.trim();

  if (password.length === 0) {
    errors.push({
      field: 'password',
      message: 'Password is required.',
    });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    errors.push({
      field: 'password',
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
    });
  }

  return password;
}
