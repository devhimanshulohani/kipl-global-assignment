import { Request, Response, NextFunction } from 'express';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import logger from '../utils/logger';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ err }, 'request error');

  if (err instanceof UniqueConstraintError) {
    return res.status(409).json({
      message: 'Resource already exists',
      fields: err.errors.map((e) => e.path),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ path: e.path, message: e.message })),
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
};
