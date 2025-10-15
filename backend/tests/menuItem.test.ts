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

describe('MenuItem Management API', () => {
  let authToken: string;
  let testUser: any;
  let testClient: any;
  let testMenu: any;
  let testCategory: any;

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
    testCategory = await createTestCategory(testMenu.id);
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/menu-items', () => {
    it('should create a new menu item', async () => {
      const menuItemData = {
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon grilled to perfection',
        priceBGN: 28.50,
        priceEUR: 14.58,
        categoryId: testCategory.id,
        menuId: testMenu.id,
        weight: 300,
        weightUnit: 'g',
        tags: ['fish', 'grilled', 'healthy'],
        allergens: ['fish'],
        available: true
      };

      const response = await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(menuItemData)
        .expect(201);

      expect(response.body.menuItem).toMatchObject({
        name: menuItemData.name,
        description: menuItemData.description,
        priceBGN: menuItemData.priceBGN,
        priceEUR: menuItemData.priceEUR,
        categoryId: menuItemData.categoryId,
        menuId: menuItemData.menuId,
        weight: menuItemData.weight,
        weightUnit: menuItemData.weightUnit,
        tags: menuItemData.tags,
        allergens: menuItemData.allergens,
        available: menuItemData.available
      });
      expect(response.body.menuItem.id).toBeDefined();
    });

    it('should reject menu item creation without auth', async () => {
      const menuItemData = {
        name: 'Unauthorized Item',
        priceBGN: 10.00,
        priceEUR: 5.11,
        categoryId: testCategory.id,
        menuId: testMenu.id
      };

      await request(app)
        .post('/api/menu-items')
        .send(menuItemData)
        .expect(401);
    });

    it('should reject invalid menu item data', async () => {
      const invalidMenuItemData = {
        name: 'Invalid Item',
        priceBGN: 15.00,
        // Missing required priceEUR
        categoryId: testCategory.id,
        menuId: testMenu.id
      };

      await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidMenuItemData)
        .expect(400);
    });

    it('should validate price ranges', async () => {
      const invalidPriceData = {
        name: 'Negative Price Item',
        priceBGN: -5.00, // Invalid negative price
        priceEUR: 2.56,
        categoryId: testCategory.id,
        menuId: testMenu.id
      };

      await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPriceData)
        .expect(400);
    });

    it('should auto-assign order if not provided', async () => {
      const menuItemData = {
        name: 'Auto Order Item',
        priceBGN: 12.00,
        priceEUR: 6.14,
        categoryId: testCategory.id,
        menuId: testMenu.id
      };

      const response = await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(menuItemData)
        .expect(201);

      expect(response.body.menuItem.order).toBeGreaterThan(0);
    });
  });

  describe('GET /api/menu-items', () => {
    let testMenuItem: any;

    beforeAll(async () => {
      testMenuItem = await createTestMenuItem(testCategory.id, testMenu.id);
    });

    it('should get all menu items', async () => {
      const response = await request(app)
        .get('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItems).toBeInstanceOf(Array);
      expect(response.body.menuItems.length).toBeGreaterThan(0);
    });

    it('should filter menu items by category', async () => {
      const response = await request(app)
        .get(`/api/menu-items?categoryId=${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItems).toBeInstanceOf(Array);
      response.body.menuItems.forEach((item: any) => {
        expect(item.categoryId).toBe(testCategory.id);
      });
    });

    it('should filter menu items by menu', async () => {
      const response = await request(app)
        .get(`/api/menu-items?menuId=${testMenu.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItems).toBeInstanceOf(Array);
      response.body.menuItems.forEach((item: any) => {
        expect(item.menuId).toBe(testMenu.id);
      });
    });

    it('should filter menu items by availability', async () => {
      // Create an unavailable item
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Unavailable Item', 
        available: false 
      });

      const response = await request(app)
        .get('/api/menu-items?available=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItems).toBeInstanceOf(Array);
      response.body.menuItems.forEach((item: any) => {
        expect(item.available).toBe(true);
      });
    });

    it('should search menu items by name', async () => {
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Searchable Pizza Margherita' 
      });

      const response = await request(app)
        .get('/api/menu-items?search=pizza')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItems).toBeInstanceOf(Array);
      expect(response.body.menuItems.some((item: any) => 
        item.name.toLowerCase().includes('pizza')
      )).toBe(true);
    });

    it('should filter by price range', async () => {
      // Create items with different prices
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Cheap Item', 
        priceBGN: 5.00, 
        priceEUR: 2.56 
      });
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Expensive Item', 
        priceBGN: 50.00, 
        priceEUR: 25.56 
      });

      const response = await request(app)
        .get('/api/menu-items?minPriceBGN=10&maxPriceBGN=30')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItems).toBeInstanceOf(Array);
      response.body.menuItems.forEach((item: any) => {
        expect(item.priceBGN).toBeGreaterThanOrEqual(10);
        expect(item.priceBGN).toBeLessThanOrEqual(30);
      });
    });

    it('should filter by tags', async () => {
      await createTestMenuItem(testCategory.id, testMenu.id, { 
        name: 'Vegan Salad', 
        tags: ['vegan', 'healthy', 'salad'] 
      });

      const response = await request(app)
        .get('/api/menu-items?tags=vegan,healthy')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItems).toBeInstanceOf(Array);
      const veganItem = response.body.menuItems.find((item: any) => 
        item.name === 'Vegan Salad'
      );
      expect(veganItem).toBeDefined();
    });

    it('should support pagination and sorting', async () => {
      const response = await request(app)
        .get('/api/menu-items?page=1&limit=2&sortBy=priceBGN&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: expect.any(Number)
      });

      // Verify sorting
      const items = response.body.menuItems;
      if (items.length > 1) {
        expect(items[0].priceBGN).toBeGreaterThanOrEqual(items[1].priceBGN);
      }
    });
  });

  describe('GET /api/menu-items/:id', () => {
    let testMenuItem: any;

    beforeAll(async () => {
      testMenuItem = await createTestMenuItem(testCategory.id, testMenu.id);
    });

    it('should get menu item by id with full details', async () => {
      const response = await request(app)
        .get(`/api/menu-items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.menuItem).toMatchObject({
        id: testMenuItem.id,
        name: testMenuItem.name,
        categoryId: testCategory.id,
        menuId: testMenu.id
      });
      expect(response.body.menuItem.category).toBeDefined();
    });

    it('should return 404 for non-existent menu item', async () => {
      await request(app)
        .get('/api/menu-items/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/menu-items/:id', () => {
    let testMenuItem: any;

    beforeEach(async () => {
      testMenuItem = await createTestMenuItem(testCategory.id, testMenu.id);
    });

    it('should update menu item details', async () => {
      const updateData = {
        name: 'Updated Item Name',
        description: 'Updated description',
        priceBGN: 25.00,
        priceEUR: 12.78,
        available: false,
        tags: ['updated', 'test'],
        allergens: ['gluten']
      };

      const response = await request(app)
        .put(`/api/menu-items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.menuItem).toMatchObject(updateData);
    });

    it('should validate update data', async () => {
      const invalidUpdate = {
        priceBGN: -10.00 // Invalid negative price
      };

      await request(app)
        .put(`/api/menu-items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate)
        .expect(400);
    });

    it('should allow partial updates', async () => {
      const partialUpdate = {
        available: false
      };

      const response = await request(app)
        .put(`/api/menu-items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.menuItem.available).toBe(false);
      expect(response.body.menuItem.name).toBe(testMenuItem.name); // Should remain unchanged
    });
  });

  describe('DELETE /api/menu-items/:id', () => {
    let testMenuItem: any;

    beforeEach(async () => {
      testMenuItem = await createTestMenuItem(testCategory.id, testMenu.id);
    });

    it('should delete menu item', async () => {
      await request(app)
        .delete(`/api/menu-items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify menu item is deleted
      await request(app)
        .get(`/api/menu-items/${testMenuItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent menu item', async () => {
      await request(app)
        .delete('/api/menu-items/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('MenuItem Ordering', () => {
    let menuItems: any[];

    beforeAll(async () => {
      // Create multiple menu items for ordering tests
      menuItems = await Promise.all([
        createTestMenuItem(testCategory.id, testMenu.id, { name: 'Item A', order: 1 }),
        createTestMenuItem(testCategory.id, testMenu.id, { name: 'Item B', order: 2 }),
        createTestMenuItem(testCategory.id, testMenu.id, { name: 'Item C', order: 3 })
      ]);
    });

    it('should reorder menu items within category', async () => {
      const reorderData = {
        itemOrders: [
          { id: menuItems[0].id, order: 3 },
          { id: menuItems[1].id, order: 1 },
          { id: menuItems[2].id, order: 2 }
        ]
      };

      const response = await request(app)
        .put(`/api/categories/${testCategory.id}/menu-items/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(reorderData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify the new order
      const updatedItems = await request(app)
        .get(`/api/menu-items?categoryId=${testCategory.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const sortedItems = updatedItems.body.menuItems;
      expect(sortedItems[0].name).toBe('Item B');
      expect(sortedItems[1].name).toBe('Item C');
      expect(sortedItems[2].name).toBe('Item A');
    });
  });

  describe('MenuItem Bulk Operations', () => {
    it('should bulk create menu items', async () => {
      const bulkCreateData = {
        menuItems: [
          {
            name: 'Bulk Item 1',
            priceBGN: 10.00,
            priceEUR: 5.11,
            order: 1
          },
          {
            name: 'Bulk Item 2',
            priceBGN: 15.00,
            priceEUR: 7.67,
            order: 2
          }
        ],
        categoryId: testCategory.id,
        menuId: testMenu.id
      };

      const response = await request(app)
        .post('/api/menu-items/bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkCreateData)
        .expect(201);

      expect(response.body.menuItems).toHaveLength(2);
      expect(response.body.menuItems[0].name).toBe('Bulk Item 1');
      expect(response.body.menuItems[1].name).toBe('Bulk Item 2');
    });

    it('should bulk update menu item availability', async () => {
      const item1 = await createTestMenuItem(testCategory.id, testMenu.id, { name: 'Bulk Update 1' });
      const item2 = await createTestMenuItem(testCategory.id, testMenu.id, { name: 'Bulk Update 2' });

      const bulkUpdateData = {
        itemIds: [item1.id, item2.id],
        updates: {
          available: false
        }
      };

      const response = await request(app)
        .put('/api/menu-items/bulk-update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bulkUpdateData)
        .expect(200);

      expect(response.body.updatedCount).toBe(2);

      // Verify updates
      const updatedItem1 = await request(app)
        .get(`/api/menu-items/${item1.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(updatedItem1.body.menuItem.available).toBe(false);
    });
  });

  describe('MenuItem Special Features', () => {
    it('should handle complex allergen and tag arrays', async () => {
      const complexItemData = {
        name: 'Complex Item',
        priceBGN: 20.00,
        priceEUR: 10.23,
        categoryId: testCategory.id,
        menuId: testMenu.id,
        tags: ['vegan', 'gluten-free', 'organic', 'spicy', 'popular'],
        allergens: ['nuts', 'sesame'],
        weight: 250,
        weightUnit: 'g'
      };

      const response = await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(complexItemData)
        .expect(201);

      expect(response.body.menuItem.tags).toEqual(complexItemData.tags);
      expect(response.body.menuItem.allergens).toEqual(complexItemData.allergens);
    });

    it('should validate weight units', async () => {
      const invalidWeightData = {
        name: 'Invalid Weight Item',
        priceBGN: 15.00,
        priceEUR: 7.67,
        categoryId: testCategory.id,
        menuId: testMenu.id,
        weight: 300,
        weightUnit: 'invalid-unit' // Should be g, kg, ml, l, etc.
      };

      await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidWeightData)
        .expect(400);
    });
  });
});