import type { Request, Response } from 'express';
import {
  buildTransactionMessage,
  serializeTransaction,
} from '../presenters/transaction.presenter.js';
import { createTransactionInService } from '../services/transaction.service.js';
import { parseTransactionInput } from '../validators/transaction.validator.js';

export async function createTransaction(req: Request, res: Response) {
  const input = parseTransactionInput(req);
  const userId = req.session.userId;
  const { transaction, wasDuplicate } = await createTransactionInService(input, userId);
  const responseStatus = wasDuplicate ? 200 : 201;

  return res.status(responseStatus).json({
    message: buildTransactionMessage(transaction.status, wasDuplicate),
    isDuplicate: wasDuplicate,
    transaction: serializeTransaction(transaction),
  });
}
