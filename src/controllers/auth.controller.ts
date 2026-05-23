import type { Request, Response } from 'express';
import { getAuthenticatedUser, loginUserInService, registerUserInService } from '../services/auth.service.js';
import { parseRegisterUserInput, parseUserCredentials } from '../validators/auth.validator.js';

export async function registerUser(req: Request, res: Response) {
  const userInput = parseRegisterUserInput(req.body);
  const createdUser = await registerUserInService(userInput);

  return res.status(201).json({
    message: 'User registered successfully.',
    user: createdUser,
  });
}

export async function loginUser(req: Request, res: Response) {
  const userCredentials = parseUserCredentials(req.body);
  const loggedInUser = await loginUserInService(userCredentials);
  await regenerateSession(req);
  req.session.userId = loggedInUser.id;
  await saveSession(req);

  return res.status(200).json({
    message: 'Logged in successfully.',
    user: loggedInUser,
  });
}

export async function getCurrentUser(req: Request, res: Response) {
  const userId = req.session.userId!;
  const user = await getAuthenticatedUser(userId);

  return res.status(200).json({
    user,
  });
}

export async function logoutUser(req: Request, res: Response) {
  await destroySession(req);
  res.clearCookie('connect.sid');

  return res.status(200).json({
    message: 'Logged out successfully.',
  });
}

function regenerateSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function destroySession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
