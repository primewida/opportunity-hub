import config from '../config/env.js';
import { AppError } from '../utils/errors.js';

export const errorHandler = (err, req, res, next) => {
  if (config.nodeEnv === 'development') {
    console.error(err);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Resource already exists' });
  }

  // Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  const response = { error: message };
  
  if (config.nodeEnv === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
