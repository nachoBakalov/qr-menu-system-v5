/**
 * Основно Express приложение
 * Това е entry point-ът на нашия backend сървър
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import config from './config';

// Middleware функции
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

// Маршрути
import authRoutes from './routes/auth';
import clientRoutes from './routes/clients';
import menuRoutes from './routes/menus';
import categoryRoutes from './routes/categories';
import menuItemRoutes from './routes/menuItems';
import templateRoutes from './routes/templates';
import publicRoutes from './routes/public';

// Инициализираме Prisma клиента
export const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Създаваме Express приложение
const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Логиране на заявки
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: '1.0.0'
  });
});

// API маршрути
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/public', publicRoutes);

// Статични файлове (за QR кодове и изображения)
app.use('/uploads', express.static('uploads'));

// 404 middleware
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Получен SIGINT сигнал. Затваряне на сървъра...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Получен SIGTERM сигнал. Затваряне на сървъра...');
  await prisma.$disconnect();
  process.exit(0);
});

// Стартиране на сървъра
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Сървърът стартира на порт ${PORT}`);
  console.log(`📊 Режим: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API base URL: http://localhost:${PORT}/api`);
});

export default app;