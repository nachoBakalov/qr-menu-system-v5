/**
 * Error Handler Middleware
 * Централизирано обработване на грешки в цялото приложение
 */

import { Request, Response, NextFunction } from 'express';
import config from '../config';

// Интерфейс за custom грешки
export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

/**
 * Централен error handler
 */
export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { statusCode = 500, message } = error;

  // Логираме грешката
  console.error('🔥 Грешка:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Prisma грешки
  if (error.message.includes('P2002')) {
    statusCode = 400;
    message = 'Записът вече съществува';
  }

  if (error.message.includes('P2025')) {
    statusCode = 404;
    message = 'Записът не е намерен';
  }

  if (error.message.includes('P2003')) {
    statusCode = 400;
    message = 'Невалидна връзка между записите';
  }

  // JWT грешки
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Невалиден токен';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Токенът е изтекъл';
  }

  // Validation грешки
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Невалидни данни';
  }

  // Response обект
  const response: any = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  // В development mode добавяме stack trace
  if (config.nodeEnv === 'development') {
    response.stack = error.stack;
    response.details = error;
  }

  res.status(statusCode).json(response);
};

/**
 * Async wrapper за handling на async грешки
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Създава custom error
 */
export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};