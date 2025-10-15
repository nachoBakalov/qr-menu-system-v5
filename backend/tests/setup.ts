import { PrismaClient } from '@prisma/client';

// Global test setup
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/menu_app_test'
    }
  }
});

// Cleanup function for tests
export const cleanup = async () => {
  // Clean up test data in reverse order due to foreign key constraints
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.client.deleteMany();
  await prisma.template.deleteMany();
  await prisma.user.deleteMany();
};

// Setup before all tests
beforeAll(async () => {
  // Ensure database connection is ready
  await prisma.$connect();
});

// Cleanup after each test
afterEach(async () => {
  await cleanup();
});

// Cleanup after all tests
afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

export { prisma };