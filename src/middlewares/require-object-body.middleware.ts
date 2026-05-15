import type { NextFunction, Request, Response } from 'express';

export function requireObjectBody(req: Request, res: Response, next: NextFunction) {
  const body = req.body;

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    res.status(400).json({
      message: 'Request body must be a JSON object.',
      errors: [
        {
          field: 'body',
          message: 'Expected a JSON object.',
        },
      ],
    });
    return;
  }

  next();
}
