import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';
import { 
  createTestUser,
  cleanupTestData 
} from './helpers';

const prisma = new PrismaClient();

describe('Integration Tests - Complete QR Menu Workflow', () => {
  let authToken: string;
  let testUser: any;
  let clientId: number;
  let menuId: number;
  let categoryId: number;
  let menuItemId: number;

  beforeAll(async () => {
    await cleanupTestData();
    
    testUser = await createTestUser({
      email: 'integration@test.com',
      name: 'Integration Test User'
    });

    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'testpassword123'
      });

    authToken = loginResponse.body.token;
    expect(authToken).toBeDefined();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('Complete Restaurant Setup Workflow', () => {
    it('should create a complete restaurant with menu system', async () => {
      // Step 1: Create a client (restaurant)
      const clientResponse = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Test Restaurant',
          slug: 'integration-test-restaurant',
          description: 'A complete test restaurant for integration testing',
          address: '123 Integration Street, Test City',
          phone: '+359888999000'
        })
        .expect(201);

      clientId = clientResponse.body.client.id;
      expect(clientResponse.body.client.name).toBe('Integration Test Restaurant');

      // Step 2: Create a menu for the restaurant
      const menuResponse = await request(app)
        .post('/api/menus')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Main Menu',
          description: 'Our main restaurant menu',
          clientId: clientId
        })
        .expect(201);

      menuId = menuResponse.body.menu.id;
      expect(menuResponse.body.menu.name).toBe('Main Menu');

      // Step 3: Create categories
      const appetizersResponse = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Appetizers',
          description: 'Start your meal right',
          menuId: menuId,
          order: 1
        })
        .expect(201);

      categoryId = appetizersResponse.body.category.id;

      const mainCoursesResponse = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Main Courses',
          description: 'Our signature dishes',
          menuId: menuId,
          order: 2
        })
        .expect(201);

      const dessertsResponse = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Desserts',
          description: 'Sweet endings',
          menuId: menuId,
          order: 3
        })
        .expect(201);

      // Step 4: Create menu items
      const saladResponse = await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Caesar Salad',
          description: 'Fresh romaine lettuce with croutons and parmesan',
          priceBGN: 14.50,
          priceEUR: 7.42,
          categoryId: categoryId,
          menuId: menuId,
          tags: ['vegetarian', 'popular'],
          allergens: ['gluten', 'dairy'],
          weight: 200,
          weightUnit: 'g'
        })
        .expect(201);

      menuItemId = saladResponse.body.menuItem.id;

      await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Bruschetta',
          description: 'Toasted bread with fresh tomatoes and basil',
          priceBGN: 9.50,
          priceEUR: 4.86,
          categoryId: categoryId,
          menuId: menuId,
          tags: ['vegetarian', 'vegan'],
          allergens: ['gluten']
        })
        .expect(201);

      await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Grilled Salmon',
          description: 'Fresh Atlantic salmon with herbs and lemon',
          priceBGN: 32.00,
          priceEUR: 16.37,
          categoryId: mainCoursesResponse.body.category.id,
          menuId: menuId,
          tags: ['fish', 'healthy', 'popular'],
          allergens: ['fish'],
          weight: 350,
          weightUnit: 'g'
        })
        .expect(201);

      await request(app)
        .post('/api/menu-items')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chocolate Cake',
          description: 'Rich chocolate cake with vanilla ice cream',
          priceBGN: 12.00,
          priceEUR: 6.14,
          categoryId: dessertsResponse.body.category.id,
          menuId: menuId,
          tags: ['dessert', 'chocolate'],
          allergens: ['gluten', 'dairy', 'eggs']
        })
        .expect(201);

      // Step 5: Publish the menu
      await request(app)
        .put(`/api/menus/${menuId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          published: true
        })
        .expect(200);
    });
  });

  describe('Menu Management Workflow', () => {
    it('should perform complete menu management operations', async () => {
      // Get the complete menu structure
      const fullMenuResponse = await request(app)
        .get(`/api/menus/${menuId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(fullMenuResponse.body.menu.categories).toHaveLength(3);
      expect(fullMenuResponse.body.menu.categories[0].name).toBe('Appetizers');

      // Update menu item
      await request(app)
        .put(`/api/menu-items/${menuItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          priceBGN: 15.50, // Price increase
          priceEUR: 7.93,
          description: 'Fresh romaine lettuce with croutons, parmesan and Caesar dressing'
        })
        .expect(200);

      // Reorder categories
      const categories = fullMenuResponse.body.menu.categories;
      const reorderResponse = await request(app)
        .put(`/api/menus/${menuId}/categories/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoryOrders: [
            { id: categories[2].id, order: 1 }, // Desserts first
            { id: categories[0].id, order: 2 }, // Appetizers second
            { id: categories[1].id, order: 3 }  // Main Courses last
          ]
        })
        .expect(200);

      expect(reorderResponse.body.success).toBe(true);

      // Verify new order
      const reorderedMenuResponse = await request(app)
        .get(`/api/menus/${menuId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const reorderedCategories = reorderedMenuResponse.body.menu.categories;
      expect(reorderedCategories[0].name).toBe('Desserts');
      expect(reorderedCategories[1].name).toBe('Appetizers');
      expect(reorderedCategories[2].name).toBe('Main Courses');
    });
  });

  describe('Public API Workflow', () => {
    it('should serve the menu through public API', async () => {
      // Test client information
      const clientResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant')
        .expect(200);

      expect(clientResponse.body.client.name).toBe('Integration Test Restaurant');

      // Test menu list
      const menusResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menus')
        .expect(200);

      expect(menusResponse.body.menus).toHaveLength(1);
      expect(menusResponse.body.menus[0].name).toBe('Main Menu');

      // Test full menu
      const publicMenuResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu')
        .expect(200);

      expect(publicMenuResponse.body.menu.name).toBe('Main Menu');
      expect(publicMenuResponse.body.menu.categories).toHaveLength(3);

      // Verify the reordered categories
      expect(publicMenuResponse.body.menu.categories[0].name).toBe('Desserts');
      expect(publicMenuResponse.body.menu.categories[1].name).toBe('Appetizers');
      expect(publicMenuResponse.body.menu.categories[2].name).toBe('Main Courses');

      // Verify updated menu item price
      const appetizers = publicMenuResponse.body.menu.categories[1];
      const caesarSalad = appetizers.menuItems.find((item: any) => item.name === 'Caesar Salad');
      expect(caesarSalad.priceBGN).toBe(15.50);
      expect(caesarSalad.priceEUR).toBe(7.93);
    });
  });

  describe('Search and Filter Workflow', () => {
    it('should search and filter menu items', async () => {
      // Search by name
      const searchResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu/search?q=salmon')
        .expect(200);

      expect(searchResponse.body.items).toHaveLength(1);
      expect(searchResponse.body.items[0].name).toBe('Grilled Salmon');

      // Filter by vegetarian tag
      const vegetarianResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu/filter?tags=vegetarian')
        .expect(200);

      expect(vegetarianResponse.body.items).toHaveLength(2); // Caesar Salad and Bruschetta
      vegetarianResponse.body.items.forEach((item: any) => {
        expect(item.tags).toContain('vegetarian');
      });

      // Filter by allergens (exclude gluten)
      const glutenFreeResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu/filter?excludeAllergens=gluten')
        .expect(200);

      expect(glutenFreeResponse.body.items).toHaveLength(1); // Only Grilled Salmon
      expect(glutenFreeResponse.body.items[0].name).toBe('Grilled Salmon');

      // Filter by price range
      const priceFilterResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu/filter?minPrice=10&maxPrice=20&currency=bgn')
        .expect(200);

      expect(priceFilterResponse.body.items).toHaveLength(2); // Caesar Salad and Chocolate Cake
    });
  });

  describe('QR Code Menu Workflow', () => {
    it('should provide QR-optimized menu', async () => {
      const qrResponse = await request(app)
        .get('/api/public/qr/integration-test-restaurant/Main%20Menu')
        .expect(200);

      expect(qrResponse.body.qrMenu).toMatchObject({
        restaurant: {
          name: 'Integration Test Restaurant',
          description: 'A complete test restaurant for integration testing',
          address: '123 Integration Street, Test City',
          phone: '+359888999000'
        },
        menu: {
          name: 'Main Menu',
          categories: expect.any(Array)
        },
        metadata: {
          generatedAt: expect.any(String),
          totalItems: 4, // All available items
          currencies: ['BGN', 'EUR']
        }
      });

      // Verify optimized structure
      const categories = qrResponse.body.qrMenu.menu.categories;
      expect(categories).toHaveLength(3);

      categories.forEach((category: any) => {
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('menuItems');
        expect(category.menuItems).toBeInstanceOf(Array);
        
        category.menuItems.forEach((item: any) => {
          expect(item).toHaveProperty('name');
          expect(item).toHaveProperty('priceBGN');
          expect(item).toHaveProperty('priceEUR');
          expect(item).not.toHaveProperty('id'); // No internal fields
        });
      });
    });
  });

  describe('Menu Statistics Workflow', () => {
    it('should provide comprehensive menu statistics', async () => {
      // Menu statistics
      const menuStatsResponse = await request(app)
        .get(`/api/menus/${menuId}/stats`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(menuStatsResponse.body.stats).toMatchObject({
        totalCategories: 3,
        totalItems: 4,
        averagePriceBGN: expect.any(Number),
        averagePriceEUR: expect.any(Number),
        priceRangeBGN: {
          min: 9.50, // Bruschetta
          max: 32.00 // Grilled Salmon
        }
      });

      // Public menu statistics
      const publicStatsResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu/stats')
        .expect(200);

      expect(publicStatsResponse.body.stats).toMatchObject({
        totalCategories: 3,
        totalAvailableItems: 4,
        topTags: expect.any(Array),
        allergensSummary: expect.any(Array)
      });

      // Popular items
      const popularResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu/popular')
        .expect(200);

      expect(popularResponse.body.popularItems).toBeInstanceOf(Array);
      const popularItems = popularResponse.body.popularItems.filter((item: any) =>
        item.tags.includes('popular')
      );
      expect(popularItems).toHaveLength(2); // Caesar Salad and Grilled Salmon
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle menu deactivation workflow', async () => {
      // Deactivate a menu item
      await request(app)
        .put(`/api/menu-items/${menuItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available: false
        })
        .expect(200);

      // Verify it doesn't appear in public API
      const publicMenuResponse = await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu')
        .expect(200);

      const appetizers = publicMenuResponse.body.menu.categories[1];
      const caesarSalad = appetizers.menuItems.find((item: any) => item.name === 'Caesar Salad');
      expect(caesarSalad).toBeUndefined();

      // Reactivate the item
      await request(app)
        .put(`/api/menu-items/${menuItemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          available: true
        })
        .expect(200);
    });

    it('should handle menu unpublishing workflow', async () => {
      // Unpublish the menu
      await request(app)
        .put(`/api/menus/${menuId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          published: false
        })
        .expect(200);

      // Should not be accessible via public API
      await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu')
        .expect(404);

      // Re-publish the menu
      await request(app)
        .put(`/api/menus/${menuId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          published: true
        })
        .expect(200);

      // Should be accessible again
      await request(app)
        .get('/api/public/client/integration-test-restaurant/menu/Main%20Menu')
        .expect(200);
    });
  });

  describe('Data Consistency Checks', () => {
    it('should maintain data consistency throughout operations', async () => {
      // Verify menu structure integrity
      const menuResponse = await request(app)
        .get(`/api/menus/${menuId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const menu = menuResponse.body.menu;
      
      // Check that all categories belong to the menu
      menu.categories.forEach((category: any) => {
        expect(category.menuId).toBe(menuId);
        
        // Check that all menu items belong to both category and menu
        category.menuItems.forEach((item: any) => {
          expect(item.categoryId).toBe(category.id);
          expect(item.menuId).toBe(menuId);
        });
      });

      // Verify database consistency
      const dbCategories = await prisma.category.findMany({
        where: { menuId: menuId }
      });

      expect(dbCategories).toHaveLength(3);
      
      const dbMenuItems = await prisma.menuItem.findMany({
        where: { menuId: menuId }
      });
      
      expect(dbMenuItems).toHaveLength(4);
    });
  });
});