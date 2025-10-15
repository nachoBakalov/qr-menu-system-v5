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

describe('Menu Management API', () => {
  let authToken: string;
  let testUser: any;
  let testClient: any;

  beforeAll(async () => {
    await cleanupTestData();
    
    testUser = await createTestUser();
    
    // Login to get auth token
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      });

    authToken = response.body.token;
    testClient = await createTestClient();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/menus', () => {
    it('should create a new menu', async () => {
      const menuData = {
        name: 'Main Menu',
        description: 'Our main restaurant menu',
        clientId: testClient.id
      };

      const response = await request(app)
        .post('/api/menus')
        .set('Authorization', `Bearer ${authToken}`)
        .send(menuData)
        .expect(201);

      expect(response.body.menu).toMatchObject({
        name: menuData.name,
        description: menuData.description,
        clientId: menuData.clientId,
        active: true
      });
      expect(response.body.menu.id).toBeDefined();
    });

    it('should reject menu creation without auth', async () => {
      const menuData = {
        name: 'Unauthorized Menu',
        clientId: testClient.id
      };

      await request(app)
        .post('/api/menus')
        .send(menuData)
        .expect(401);
    });

    it('should reject invalid menu data', async () => {
      const invalidMenuData = {
        // Missing required name field
        clientId: testClient.id
      };

      await request(app)
        .post('/api/menus')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMenuData)
        .expect(400);
    });
  });

  describe('GET /api/menus', () => {
    let testMenu: any;

    beforeAll(async () => {
      testMenu = await createTestMenu(testClient.id);
    });

    it('should get all menus', async () => {
      const response = await request(app)
        .get('/api/menus')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menus).toBeInstanceOf(Array);
      expect(response.body.menus.length).toBeGreaterThan(0);
    });

    it('should filter menus by client', async () => {
      const response = await request(app)
        .get(`/api/menus?clientId=${testClient.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menus).toBeInstanceOf(Array);
      response.body.menus.forEach((menu: any) => {
        expect(menu.clientId).toBe(testClient.id);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/menus?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 1,
        total: expect.any(Number)
      });
    });
  });

  describe('GET /api/menus/:id', () => {
    let testMenu: any;

    beforeAll(async () => {
      testMenu = await createTestMenu(testClient.id);
    });

    it('should get menu by id with full details', async () => {
      const response = await request(app)
        .get(`/api/menus/${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menu).toMatchObject({
        id: testMenu.id,
        name: testMenu.name,
        clientId: testClient.id
      });
      expect(response.body.menu.categories).toBeInstanceOf(Array);
    });

    it('should return 404 for non-existent menu', async () => {
      await request(app)
        .get('/api/menus/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/menus/:id', () => {
    let testMenu: any;

    beforeEach(async () => {
      testMenu = await createTestMenu(testClient.id);
    });

    it('should update menu details', async () => {
      const updateData = {
        name: 'Updated Menu Name',
        description: 'Updated description',
        active: false
      };

      const response = await request(app)
        .put(`/api/menus/${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.menu).toMatchObject(updateData);
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        name: '' // Empty name should be invalid
      };

      await request(app)
        .put(`/api/menus/${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate)
        .expect(400);
    });
  });

  describe('DELETE /api/menus/:id', () => {
    let testMenu: any;

    beforeEach(async () => {
      testMenu = await createTestMenu(testClient.id);
    });

    it('should delete menu and cascade to related data', async () => {
      // Create some categories and items for the menu
      const category = await createTestCategory(testMenu.id);
      const menuItem = await createTestMenuItem(category.id, testMenu.id);

      await request(app)
        .delete(`/api/menus/${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify menu is deleted
      await request(app)
        .get(`/api/menus/${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Verify cascade deletion
      const deletedCategory = await prisma.category.findUnique({
        where: { id: category.id }
      });
      expect(deletedCategory).toBeNull();

      const deletedMenuItem = await prisma.menuItem.findUnique({
        where: { id: menuItem.id }
      });
      expect(deletedMenuItem).toBeNull();
    });

    it('should return 404 when deleting non-existent menu', async () => {
      await request(app)
        .delete('/api/menus/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Menu Statistics', () => {
    let testMenu: any;

    beforeAll(async () => {
      testMenu = await createTestMenu(testClient.id);
      
      // Create test data for statistics
      const category1 = await createTestCategory(testMenu.id, { name: 'Appetizers' });
      const category2 = await createTestCategory(testMenu.id, { name: 'Main Courses' });
      
      await createTestMenuItem(category1.id, testMenu.id, { name: 'Salad', priceBGN: 12.50, priceEUR: 6.25 });
      await createTestMenuItem(category1.id, testMenu.id, { name: 'Soup', priceBGN: 8.00, priceEUR: 4.00 });
      await createTestMenuItem(category2.id, testMenu.id, { name: 'Steak', priceBGN: 35.00, priceEUR: 17.50 });
    });

    it('should calculate menu statistics correctly', async () => {
      const response = await request(app)
        .get(`/api/menus/${testMenu.id}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.stats).toMatchObject({
        totalCategories: 2,
        totalItems: 3,
        averagePriceBGN: expect.any(Number),
        averagePriceEUR: expect.any(Number),
        priceRangeBGN: {
          min: 8.00,
          max: 35.00
        },
        priceRangeEUR: {
          min: 4.00,
          max: 17.50
        }
      });

      expect(response.body.stats.averagePriceBGN).toBeCloseTo(18.50, 2);
      expect(response.body.stats.averagePriceEUR).toBeCloseTo(9.25, 2);
    });
  });

  describe('Menu Templates', () => {
    it('should create menu from template', async () => {
      const templateData = {
        name: 'Pizza Menu',
        clientId: testClient.id,
        template: 'restaurant'
      };

      const response = await request(app)
        .post('/api/menus/from-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);

      expect(response.body.menu.name).toBe(templateData.name);
      expect(response.body.menu.categories).toBeInstanceOf(Array);
      expect(response.body.menu.categories.length).toBeGreaterThan(0);
    });

    it('should reject invalid template type', async () => {
      const invalidTemplate = {
        name: 'Invalid Menu',
        clientId: testClient.id,
        template: 'non-existent-template'
      };

      await request(app)
        .post('/api/menus/from-template')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTemplate)
        .expect(400);
    });
  });

  describe('Menu Cloning', () => {
    let sourceMenu: any;

    beforeAll(async () => {
      sourceMenu = await createTestMenu(testClient.id, { name: 'Source Menu' });
      const category = await createTestCategory(sourceMenu.id);
      await createTestMenuItem(category.id, sourceMenu.id);
    });

    it('should clone existing menu with all data', async () => {
      const cloneData = {
        name: 'Cloned Menu',
        clientId: testClient.id
      };

      const response = await request(app)
        .post(`/api/menus/${sourceMenu.id}/clone`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cloneData)
        .expect(201);

      expect(response.body.menu.name).toBe(cloneData.name);
      expect(response.body.menu.id).not.toBe(sourceMenu.id);
      expect(response.body.menu.categories).toBeInstanceOf(Array);
      expect(response.body.menu.categories.length).toBeGreaterThan(0);
    });
  });
});