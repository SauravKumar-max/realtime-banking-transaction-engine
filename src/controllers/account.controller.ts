import type { Request, Response } from 'express';
import { serializeAccountWithUser } from '../presenters/account.presenter.js';
import { parseCreateAccountInput } from '../validators/account.validator.js';
import { createAccountInService } from '../services/account.service.js';

export async function createAccount(req: Request, res: Response) {
  const input = parseCreateAccountInput(req.body);
  const userId = req.session.userId;
  const createdAccount = await createAccountInService(input, userId);

  return res.status(201).json({
    message: 'Account created successfully.',
    account: serializeAccountWithUser(createdAccount),
  });
}
