/**
 * Authentication Middleware
 * Проверява дали потребителят е аутентифициран
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import config from '../config';
import { createError } from './errorHandler';

// Разширяваме Request интерфейса
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: string;
      };
    }
  }
}

/**
 * Middleware за проверка на JWT токен
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Извличаме токена от header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Липсва токен за аутентификация', 401);
    }

    const token = authHeader.substring(7); // Премахваме "Bearer "

    // Верифицираме токена
    const decoded = jwt.verify(token, config.jwt.secret) as {
      userId: string;
      email: string;
    };

    // Намираме потребителя в базата
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      throw createError('Потребителят не е намерен', 401);
    }

    // Добавяме потребителя към request обекта
    req.user = {
      id: user.id, // Вече е number от Prisma
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware за проверка на роля
 */
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Неaутентифициран достъп', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError('Нямате права за този ресурс', 403));
    }

    next();
  };
};

/**
 * Middleware само за admin
 */
export const adminOnly = authorize(['ADMIN']);