/**
 * Authentication Controller
 * Обработва логиката за аутентификация
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';
import config from '../config';
import { asyncHandler, createError } from '../middlewares/errorHandler';
import { LoginDto } from '../types';

/**
 * POST /api/auth/login
 * Вход в системата
 */
const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginDto = req.body;

  // Валидацията вече се прави от middleware-а

  // Намираме потребителя
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!user) {
    throw createError('Невалиден email или парола', 401);
  }

  // Проверяваме паролата
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createError('Невалиден email или парола', 401);
  }

  // Генерираме JWT токен
  const token = jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    },
    config.jwt.secret,
    { expiresIn: '24h' }
  );

  // Връщаме потребителя без паролата и токена
  const { password: _, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Успешен вход',
    data: {
      user: userWithoutPassword,
      token
    }
  });
});

/**
 * GET /api/auth/me
 * Връща информация за текущия потребител
 */
const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Потребителят не е аутентифициран', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!user) {
    throw createError('Потребителят не е намерен', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

/**
 * POST /api/auth/logout
 * Изход от системата (за бъдеща функционалност с blacklist tokens)
 */
const logout = asyncHandler(async (req: Request, res: Response) => {
  // За сега просто връщаме успех
  // В бъдеще тук можем да добавим токена в blacklist
  res.json({
    success: true,
    message: 'Успешен изход'
  });
});

export const authController = {
  login,
  getMe,
  logout
};