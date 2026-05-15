export type AppError = {
  type: string;
  statusCode: number;
  message: string;
  details?: unknown;
};
