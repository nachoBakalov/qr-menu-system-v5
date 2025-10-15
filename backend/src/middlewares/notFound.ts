/**
 * Not Found Middleware
 * Обработва 404 грешки за неизвестни endpoints
 */

import { Request, Response, NextFunction } from 'express';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const message = `Маршрутът ${req.method} ${req.originalUrl} не е намерен`;
  
  res.status(404).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};