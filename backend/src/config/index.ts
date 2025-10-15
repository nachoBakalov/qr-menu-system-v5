/**
 * Конфигурация на приложението
 * Всички конфигурационни настройки са централизирани тук
 */

import dotenv from 'dotenv';

// Зарежда environment variables от .env файла
dotenv.config();

export const config = {
  // Сървър настройки
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // База данни
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT настройки
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  // CORS настройки
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 минути
    max: 100 // максимум 100 заявки за 15 минути
  },
  
  // Upload настройки
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
  },
  
  // URL настройки
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
  clientUrl: process.env.CLIENT_URL || 'https://burgasdigitalstudio.bg'
};

// Валидация на задължителни environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export default config;