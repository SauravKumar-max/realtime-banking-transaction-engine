import { sql } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { db } from '../db/connection.js';

export function getWelcomeMessage(_req: Request, res: Response) {
  res.status(200).json({
    message: 'Welcome to Real-Time Banking Transaction Processing System',
  });
}

export async function getHealthStatus(_req: Request, res: Response) {
  try {
    await db.execute(sql`select 1`);
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
}
