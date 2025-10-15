import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { 
  createTestUser, 
  createTestClient,
  createTestMenu,
  createTestCategory,
  createTestMenuItem,
  cleanupTestData 
} from './helpers';

const prisma = new PrismaClient();

describe('Category Management API', () => {
  let authToken: string;
  let testUser: any;
  let testClient: any;
  let testMenu: any;

  beforeAll(async () => {
    await cleanupTestData();
    
    testUser = await createTestUser();
    
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'testpassword123'
      });

    authToken = response.body.token;
    testClient = await createTestClient();
    testMenu = await createTestMenu(testClient.id);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'Appetizers',
        description: 'Start your meal right',
        menuId: testMenu.id,
        order: 1
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.category).toMatchObject({
        name: categoryData.name,
        description: categoryData.description,
        menuId: categoryData.menuId,
        order: categoryData.order,
        active: true
      });
      expect(response.body.category.id).toBeDefined();
    });

    it('should reject category creation without auth', async () => {
      const categoryData = {
        name: 'Unauthorized Category',
        menuId: testMenu.id
      };

      await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(401);
    });

    it('should reject invalid category data', async () => {
      const invalidCategoryData = {
        // Missing required name field
        menuId: testMenu.id
      };

      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCategoryData)
        .expect(400);
    });

    it('should auto-assign order if not provided', async () => {
      // Create a category without order
      const categoryData = {
        name: 'Main Courses',
        menuId: testMenu.id
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.category.order).toBeGreaterThan(0);
    });
  });

  describe('GET /api/categories', () => {
    let testCategory: any;

    beforeAll(async () => {
      testCategory = await createTestCategory(testMenu.id);
    });

    it('should get all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.categories).toBeInstanceOf(Array);
      expect(response.body.categories.length).toBeGreaterThan(0);
    });

    it('should filter categories by menu', async () => {
      const response = await request(app)
        .get(`/api/categories?menuId=${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.categories).toBeInstanceOf(Array);
      response.body.categories.forEach((category: any) => {
        expect(category.menuId).toBe(testMenu.id);
      });
    });

    it('should return categories ordered by order field', async () => {
      // Create multiple categories with different orders
      await createTestCategory(testMenu.id, { name: 'Second Category', order: 2 });
      await createTestCategory(testMenu.id, { name: 'First Category', order: 1 });
      await createTestCategory(testMenu.id, { name: 'Third Category', order: 3 });

      const response = await request(app)
        .get(`/api/categories?menuId=${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const categories = response.body.categories;
      for (let i = 1; i < categories.length; i++) {
        expect(categories[i].order).toBeGreaterThanOrEqual(categories[i - 1].order);
      }
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/categories?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: expect.any(Number)
      });
    });
  });

  describe('GET /api/categories/:id', () => {
    let testCategory: any;

    beforeAll(async () => {
      testCategory = await createTestCategory(testMenu.id);
    });

    it('should get category by id with menu items', async () => {
      // Add some menu items to the category
      await createTestMenuItem(testCategory.id, testMenu.id);
      await createTestMenuItem(testCategory.id, testMenu.id, { name: 'Second Item' });

      const response = await request(app)
        .get(`/api/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.category).toMatchObject({
        id: testCategory.id,
        name: testCategory.name,
        menuId: testMenu.id
      });
      expect(response.body.category.menuItems).toBeInstanceOf(Array);
      expect(response.body.category.menuItems.length).toBe(2);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get('/api/categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/categories/:id', () => {
    let testCategory: any;

    beforeEach(async () => {
      testCategory = await createTestCategory(testMenu.id);
    });

    it('should update category details', async () => {
      const updateData = {
        name: 'Updated Category Name',
        description: 'Updated description',
        order: 5,
        active: false
      };

      const response = await request(app)
        .put(`/api/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.category).toMatchObject(updateData);
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        name: '' // Empty name should be invalid
      };

      await request(app)
        .put(`/api/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate)
        .expect(400);
    });

    it('should prevent duplicate orders in same menu', async () => {
      const existingCategory = await createTestCategory(testMenu.id, { order: 1 });
      
      const duplicateOrderUpdate = {
        order: 1 // Same order as existing category
      };

      await request(app)
        .put(`/api/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateOrderUpdate)
        .expect(400);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    let testCategory: any;

    beforeEach(async () => {
      testCategory = await createTestCategory(testMenu.id);
    });

    it('should delete category and cascade to menu items', async () => {
      // Create some menu items for the category
      const menuItem1 = await createTestMenuItem(testCategory.id, testMenu.id);
      const menuItem2 = await createTestMenuItem(testCategory.id, testMenu.id, { name: 'Second Item' });

      await request(app)
        .delete(`/api/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify category is deleted
      await request(app)
        .get(`/api/categories/${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Verify cascade deletion of menu items
      const deletedMenuItem1 = await prisma.menuItem.findUnique({
        where: { id: menuItem1.id }
      });
      expect(deletedMenuItem1).toBeNull();

      const deletedMenuItem2 = await prisma.menuItem.findUnique({
        where: { id: menuItem2.id }
      });
      expect(deletedMenuItem2).toBeNull();
    });

    it('should return 404 when deleting non-existent category', async () => {
      await request(app)
        .delete('/api/categories/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Category Ordering', () => {
    let categories: any[];

    beforeAll(async () => {
      // Create multiple categories for ordering tests
      categories = await Promise.all([
        createTestCategory(testMenu.id, { name: 'Category A', order: 1 }),
        createTestCategory(testMenu.id, { name: 'Category B', order: 2 }),
        createTestCategory(testMenu.id, { name: 'Category C', order: 3 })
      ]);
    });

    it('should reorder categories', async () => {
      const reorderData = {
        categoryOrders: [
          { id: categories[0].id, order: 3 },
          { id: categories[1].id, order: 1 },
          { id: categories[2].id, order: 2 }
        ]
      };

      const response = await request(app)
        .put(`/api/menus/${testMenu.id}/categories/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reorderData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify the new order
      const updatedCategories = await request(app)
        .get(`/api/categories?menuId=${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const sortedCategories = updatedCategories.body.categories;
      expect(sortedCategories[0].name).toBe('Category B');
      expect(sortedCategories[1].name).toBe('Category C');
      expect(sortedCategories[2].name).toBe('Category A');
    });

    it('should validate reorder data', async () => {
      const invalidReorderData = {
        categoryOrders: [
          { id: categories[0].id }, // Missing order field
          { order: 2 } // Missing id field
        ]
      };

      await request(app)
        .put(`/api/menus/${testMenu.id}/categories/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidReorderData)
        .expect(400);
    });
  });

  describe('Category Statistics', () => {
    let testCategory: any;

    beforeAll(async () => {
      testCategory = await createTestCategory(testMenu.id, { name: 'Stats Category' });
      
      // Create test menu items with different prices
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Cheap Item', 
        priceBGN: 5.00, 
        priceEUR: 2.50 
      });
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Expensive Item', 
        priceBGN: 25.00, 
        priceEUR: 12.50 
      });
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Medium Item', 
        priceBGN: 15.00, 
        priceEUR: 7.50 
      });
    });

    it('should calculate category statistics correctly', async () => {
      const response = await request(app)
        .get(`/api/categories/${testCategory.id}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stats).toMatchObject({
        totalItems: 3,
        averagePriceBGN: expect.any(Number),
        averagePriceEUR: expect.any(Number),
        priceRangeBGN: {
          min: 5.00,
          max: 25.00
        },
        priceRangeEUR: {
          min: 2.50,
          max: 12.50
        }
      });

      expect(response.body.stats.averagePriceBGN).toBeCloseTo(15.00, 2);
      expect(response.body.stats.averagePriceEUR).toBeCloseTo(7.50, 2);
    });
  });

  describe('Category Bulk Operations', () => {
    it('should bulk create categories', async () => {
      const bulkCreateData = {
        categories: [
          { name: 'Bulk Category 1', order: 1 },
          { name: 'Bulk Category 2', order: 2 },
          { name: 'Bulk Category 3', order: 3 }
        ],
        menuId: testMenu.id
      };

      const response = await request(app)
        .post('/api/categories/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkCreateData)
        .expect(201);

      expect(response.body.categories).toHaveLength(3);
      expect(response.body.categories[0].name).toBe('Bulk Category 1');
      expect(response.body.categories[1].name).toBe('Bulk Category 2');
      expect(response.body.categories[2].name).toBe('Bulk Category 3');
    });

    it('should bulk update categories', async () => {
      const category1 = await createTestCategory(testMenu.id, { name: 'Update Me 1' });
      const category2 = await createTestCategory(testMenu.id, { name: 'Update Me 2' });

      const bulkUpdateData = {
        updates: [
          { id: category1.id, name: 'Updated Category 1', active: false },
          { id: category2.id, name: 'Updated Category 2', order: 10 }
        ]
      };

      const response = await request(app)
        .put('/api/categories/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkUpdateData)
        .expect(200);

      expect(response.body.categories).toHaveLength(2);
      expect(response.body.categories.find((c: any) => c.id === category1.id).name).toBe('Updated Category 1');
      expect(response.body.categories.find((c: any) => c.id === category2.id).order).toBe(10);
    });
  });
});