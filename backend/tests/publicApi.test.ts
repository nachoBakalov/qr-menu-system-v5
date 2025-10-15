import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { 
  createTestClient,
  createTestMenu,
  createTestCategory,
  createTestMenuItem,
  cleanupTestData 
} from './helpers';

const prisma = new PrismaClient();

describe('Public API', () => {
  let testClient: any;
  let testMenu: any;
  let testCategory1: any;
  let testCategory2: any;

  beforeAll(async () => {
    await cleanupTestData();
    
    // Create test data for public API
    testClient = await createTestClient({
      name: 'Public Test Restaurant',
      slug: 'public-test-restaurant',
      active: true
    });

    testMenu = await createTestMenu(testClient.id, {
      name: 'Public Test Menu',
      active: true,
      published: true
    });

    testCategory1 = await createTestCategory(testMenu.id, {
      name: 'Appetizers',
      description: 'Start your meal right',
      order: 1,
      active: true
    });

    testCategory2 = await createTestCategory(testMenu.id, {
      name: 'Main Courses',
      description: 'Our signature dishes',
      order: 2,
      active: true
    });

    // Create menu items
    await createTestMenuItem(testCategory1.id, testMenu.id, {
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with parmesan cheese',
      priceBGN: 12.00,
      priceEUR: 6.14,
      available: true,
      order: 1,
      tags: ['vegetarian', 'popular'],
      allergens: ['dairy', 'gluten']
    });

    await createTestMenuItem(testCategory1.id, testMenu.id, {
      name: 'Bruschetta',
      description: 'Toasted bread with tomatoes and basil',
      priceBGN: 8.50,
      priceEUR: 4.35,
      available: true,
      order: 2,
      tags: ['vegetarian', 'vegan'],
      allergens: ['gluten']
    });

    await createTestMenuItem(testCategory2.id, testMenu.id, {
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with herbs',
      priceBGN: 28.00,
      priceEUR: 14.32,
      available: true,
      order: 1,
      tags: ['fish', 'healthy', 'popular'],
      allergens: ['fish']
    });

    await createTestMenuItem(testCategory2.id, testMenu.id, {
      name: 'Unavailable Dish',
      description: 'This should not appear in public API',
      priceBGN: 25.00,
      priceEUR: 12.78,
      available: false, // Not available
      order: 2
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('GET /api/public/client/:slug', () => {
    it('should get client information by slug', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}`)
        .expect(200);

      expect(response.body.client).toMatchObject({
        name: testClient.name,
        slug: testClient.slug,
        description: testClient.description,
        address: testClient.address,
        phone: testClient.phone,
        active: true
      });

      // Should not expose internal fields
      expect(response.body.client.id).toBeUndefined();
      expect(response.body.client.createdAt).toBeUndefined();
      expect(response.body.client.updatedAt).toBeUndefined();
    });

    it('should return 404 for non-existent client slug', async () => {
      await request(app)
        .get('/api/public/client/non-existent-slug')
        .expect(404);
    });

    it('should return 404 for inactive client', async () => {
      const inactiveClient = await createTestClient({
        name: 'Inactive Restaurant',
        slug: 'inactive-restaurant',
        active: false
      });

      await request(app)
        .get(`/api/public/client/${inactiveClient.slug}`)
        .expect(404);
    });
  });

  describe('GET /api/public/client/:slug/menus', () => {
    it('should get published menus for client', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menus`)
        .expect(200);

      expect(response.body.menus).toBeInstanceOf(Array);
      expect(response.body.menus.length).toBeGreaterThan(0);

      const menu = response.body.menus[0];
      expect(menu).toMatchObject({
        name: testMenu.name,
        active: true,
        published: true
      });

      // Should not expose internal fields
      expect(menu.id).toBeUndefined();
      expect(menu.clientId).toBeUndefined();
    });

    it('should not return unpublished menus', async () => {
      // Create an unpublished menu
      await createTestMenu(testClient.id, {
        name: 'Draft Menu',
        active: true,
        published: false
      });

      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menus`)
        .expect(200);

      // Should only return published menus
      expect(response.body.menus.every((menu: any) => menu.published === true)).toBe(true);
    });
  });

  describe('GET /api/public/client/:slug/menu/:menuName', () => {
    it('should get full menu with categories and items', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}`)
        .expect(200);

      expect(response.body.menu).toMatchObject({
        name: testMenu.name,
        active: true,
        published: true
      });

      expect(response.body.menu.categories).toBeInstanceOf(Array);
      expect(response.body.menu.categories.length).toBe(2);

      // Verify categories are ordered correctly
      expect(response.body.menu.categories[0].name).toBe('Appetizers');
      expect(response.body.menu.categories[1].name).toBe('Main Courses');

      // Verify menu items in first category
      const appetizers = response.body.menu.categories[0];
      expect(appetizers.menuItems).toBeInstanceOf(Array);
      expect(appetizers.menuItems.length).toBe(2); // Only available items

      // Verify menu items have all required public fields
      const firstItem = appetizers.menuItems[0];
      expect(firstItem).toMatchObject({
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with parmesan cheese',
        priceBGN: 12.00,
        priceEUR: 6.14,
        available: true,
        tags: ['vegetarian', 'popular'],
        allergens: ['dairy', 'gluten']
      });

      // Should not expose internal fields
      expect(firstItem.id).toBeUndefined();
      expect(firstItem.categoryId).toBeUndefined();
      expect(firstItem.menuId).toBeUndefined();
    });

    it('should only return available menu items', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}`)
        .expect(200);

      const allItems = response.body.menu.categories
        .flatMap((category: any) => category.menuItems);

      // All items should be available
      expect(allItems.every((item: any) => item.available === true)).toBe(true);

      // Should not include the unavailable dish
      expect(allItems.some((item: any) => item.name === 'Unavailable Dish')).toBe(false);
    });

    it('should return 404 for non-existent menu', async () => {
      await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/non-existent-menu`)
        .expect(404);
    });

    it('should return 404 for unpublished menu', async () => {
      const draftMenu = await createTestMenu(testClient.id, {
        name: 'Draft Menu',
        active: true,
        published: false
      });

      await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(draftMenu.name)}`)
        .expect(404);
    });
  });

  describe('GET /api/public/client/:slug/menu/:menuName/category/:categoryName', () => {
    it('should get specific category with items', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/category/${encodeURIComponent('Appetizers')}`)
        .expect(200);

      expect(response.body.category).toMatchObject({
        name: 'Appetizers',
        description: 'Start your meal right',
        order: 1,
        active: true
      });

      expect(response.body.category.menuItems).toBeInstanceOf(Array);
      expect(response.body.category.menuItems.length).toBe(2);

      // Should not expose internal fields
      expect(response.body.category.id).toBeUndefined();
      expect(response.body.category.menuId).toBeUndefined();
    });

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/category/non-existent-category`)
        .expect(404);
    });
  });

  describe('Menu Search and Filtering', () => {
    it('should search menu items by name', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/search?q=salmon`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].name).toBe('Grilled Salmon');
    });

    it('should filter menu items by tags', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/filter?tags=vegetarian`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBe(2); // Caesar Salad and Bruschetta

      response.body.items.forEach((item: any) => {
        expect(item.tags).toContain('vegetarian');
      });
    });

    it('should filter menu items by allergens (exclude)', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/filter?excludeAllergens=gluten`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      
      response.body.items.forEach((item: any) => {
        expect(item.allergens).not.toContain('gluten');
      });
    });

    it('should filter menu items by price range', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/filter?minPrice=10&maxPrice=15&currency=bgn`)
        .expect(200);

      expect(response.body.items).toBeInstanceOf(Array);
      
      response.body.items.forEach((item: any) => {
        expect(item.priceBGN).toBeGreaterThanOrEqual(10);
        expect(item.priceBGN).toBeLessThanOrEqual(15);
      });
    });

    it('should sort menu items by price', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}?sortBy=price&sortOrder=asc`)
        .expect(200);

      const allItems = response.body.menu.categories
        .flatMap((category: any) => category.menuItems);

      // Verify ascending price order
      for (let i = 1; i < allItems.length; i++) {
        expect(allItems[i].priceBGN).toBeGreaterThanOrEqual(allItems[i - 1].priceBGN);
      }
    });
  });

  describe('Menu Statistics for Public', () => {
    it('should get public menu statistics', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/stats`)
        .expect(200);

      expect(response.body.stats).toMatchObject({
        totalCategories: 2,
        totalAvailableItems: 3, // Only available items counted
        priceRangeBGN: {
          min: expect.any(Number),
          max: expect.any(Number)
        },
        priceRangeEUR: {
          min: expect.any(Number),
          max: expect.any(Number)
        },
        topTags: expect.any(Array),
        allergensSummary: expect.any(Array)
      });

      expect(response.body.stats.priceRangeBGN.min).toBe(8.50); // Bruschetta
      expect(response.body.stats.priceRangeBGN.max).toBe(28.00); // Grilled Salmon
    });

    it('should get popular items (by tags)', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}/menu/${encodeURIComponent(testMenu.name)}/popular`)
        .expect(200);

      expect(response.body.popularItems).toBeInstanceOf(Array);
      
      // Items tagged as "popular" should be first
      const popularItems = response.body.popularItems.filter((item: any) => 
        item.tags.includes('popular')
      );
      expect(popularItems.length).toBe(2); // Caesar Salad and Grilled Salmon
    });
  });

  describe('QR Code Integration', () => {
    it('should provide QR-friendly menu structure', async () => {
      const response = await request(app)
        .get(`/api/public/qr/${testClient.slug}/${encodeURIComponent(testMenu.name)}`)
        .expect(200);

      expect(response.body.qrMenu).toMatchObject({
        restaurant: {
          name: testClient.name,
          description: testClient.description,
          address: testClient.address,
          phone: testClient.phone
        },
        menu: {
          name: testMenu.name,
          categories: expect.any(Array)
        },
        metadata: {
          generatedAt: expect.any(String),
          totalItems: 3,
          currencies: ['BGN', 'EUR']
        }
      });

      // Should be optimized for mobile display
      expect(response.body.qrMenu.menu.categories[0].menuItems[0]).toHaveProperty('name');
      expect(response.body.qrMenu.menu.categories[0].menuItems[0]).toHaveProperty('priceBGN');
      expect(response.body.qrMenu.menu.categories[0].menuItems[0]).toHaveProperty('priceEUR');
    });
  });

  describe('Error Handling', () => {
    it('should handle special characters in URLs', async () => {
      const specialClient = await createTestClient({
        name: 'Ресторант "При Иван"',
        slug: 'restaurant-pri-ivan',
        active: true
      });

      const response = await request(app)
        .get(`/api/public/client/${specialClient.slug}`)
        .expect(200);

      expect(response.body.client.name).toBe('Ресторант "При Иван"');
    });

    it('should return appropriate CORS headers for public API', async () => {
      const response = await request(app)
        .get(`/api/public/client/${testClient.slug}`)
        .expect(200);

      // Should allow cross-origin requests for public API
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should handle rate limiting gracefully', async () => {
      // Make multiple requests in quick succession
      const requests = Array(10).fill(null).map(() =>
        request(app).get(`/api/public/client/${testClient.slug}`)
      );

      const responses = await Promise.all(requests);
      
      // All should succeed (or some might be rate limited, but should handle gracefully)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });
  });
});