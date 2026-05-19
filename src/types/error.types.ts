export type AppError = {
  type: string;
  statusCode: number;
  message: string;
  details?: unknown;
};

export type ValidationDetail = {
  field: string;
  message: string;
};
