import type { Request, Response } from 'express';
import { registerUser as registerUserInService } from '../services/auth.service.js';
import { parseRegisterUserInput } from '../utils/auth-validation.js';

export async function registerUser(req: Request, res: Response) {
  const userInput = parseRegisterUserInput(req.body);
  const createdUser = await registerUserInService(userInput);

  return res.status(201).json({
    message: 'User registered successfully.',
    user: createdUser,
  });
}
