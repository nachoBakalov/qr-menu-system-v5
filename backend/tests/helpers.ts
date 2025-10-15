import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Test data factory functions
export const createTestUser = async (userData?: Partial<any>) => {
  const hashedPassword = await bcrypt.hash('testpassword123', 10);
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  
  return await prisma.user.create({
    data: {
      email: `test${timestamp}${randomId}@admin.com`,
      password: hashedPassword,
      name: 'Test Admin',
      role: 'ADMIN',
      ...userData
    }
  });
};

export const createTestClient = async (clientData?: Partial<any>) => {
  return await prisma.client.create({
    data: {
      name: 'Test Restaurant',
      slug: 'test-restaurant',
      description: 'A test restaurant for unit testing',
      address: '123 Test Street',
      phone: '+359888123456',
      active: true,
      ...clientData
    }
  });
};

export const createTestMenu = async (clientId: number, menuData?: Partial<any>) => {
  return await prisma.menu.create({
    data: {
      name: 'Test Menu',
      clientId: clientId,
      active: true,
      published: false,
      ...menuData
    }
  });
};

export const createTestCategory = async (menuId: number, categoryData?: Partial<any>) => {
  return await prisma.category.create({
    data: {
      name: 'Test Category',
      description: 'A test category',
      menuId: menuId,
      order: 1,
      active: true,
      ...categoryData
    }
  });
};

export const createTestMenuItem = async (categoryId: number, menuId: number, itemData?: Partial<any>) => {
  return await prisma.menuItem.create({
    data: {
      name: 'Test Item',
      description: 'A test menu item',
      priceBGN: 12.50,
      priceEUR: 6.38,
      categoryId: categoryId,
      menuId: menuId,
      available: true,
      order: 1,
      tags: ['test'],
      allergens: [],
      ...itemData
    }
  });
};

export const createTestTemplate = async (templateData?: Partial<any>) => {
  return await prisma.template.create({
    data: {
      name: 'Test Template',
      description: 'A test template',
      active: true,
      ...templateData
    }
  });
};

// JWT token generation for testing
export const generateTestToken = (userId: string) => {
  return jwt.sign(
    { userId, role: 'ADMIN' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

// Auth headers helper
export const getAuthHeaders = (token: string) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Test data cleanup helpers
export const cleanupTestData = async () => {
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany(); 
  await prisma.menu.deleteMany();
  await prisma.client.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();
};