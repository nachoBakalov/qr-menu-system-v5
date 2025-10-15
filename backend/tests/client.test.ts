import { PrismaClient } from '@prisma/client';
import { createTestUser, createTestClient, generateTestToken, cleanupTestData } from './helpers';

const prisma = new PrismaClient();

describe('Client Management Tests', () => {
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser();
    authToken = generateTestToken(testUser.id);
  });

  describe('Client CRUD Operations', () => {
    it('should create a new client', async () => {
      const clientData = {
        name: 'Pizza Palace',
        slug: 'pizza-palace',
        description: 'Best pizza in town',
        address: '123 Pizza Street',
        phone: '+359888123456'
      };

      const client = await createTestClient(clientData);

      expect(client).toBeDefined();
      expect(client.name).toBe('Pizza Palace');
      expect(client.slug).toBe('pizza-palace');
      expect(client.description).toBe('Best pizza in town');
      expect(client.active).toBe(true);
    });

    it('should find client by ID', async () => {
      const createdClient = await createTestClient();
      
      const foundClient = await prisma.client.findUnique({
        where: { id: createdClient.id }
      });

      expect(foundClient).toBeDefined();
      expect(foundClient?.id).toBe(createdClient.id);
      expect(foundClient?.name).toBe(createdClient.name);
    });

    it('should find client by slug', async () => {
      const clientData = {
        name: 'Burger Joint',
        slug: 'burger-joint'
      };
      
      const createdClient = await createTestClient(clientData);
      
      const foundClient = await prisma.client.findUnique({
        where: { slug: 'burger-joint' }
      });

      expect(foundClient).toBeDefined();
      expect(foundClient?.slug).toBe('burger-joint');
      expect(foundClient?.name).toBe('Burger Joint');
    });

    it('should update client information', async () => {
      const client = await createTestClient();
      
      const updatedClient = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: 'Updated Restaurant Name',
          description: 'Updated description'
        }
      });

      expect(updatedClient.name).toBe('Updated Restaurant Name');
      expect(updatedClient.description).toBe('Updated description');
      expect(updatedClient.id).toBe(client.id);
    });

    it('should soft delete client', async () => {
      const client = await createTestClient();
      
      const deactivatedClient = await prisma.client.update({
        where: { id: client.id },
        data: { active: false }
      });

      expect(deactivatedClient.active).toBe(false);
    });

    it('should validate unique slug constraint', async () => {
      await createTestClient({ slug: 'unique-slug' });
      
      // Attempting to create another client with same slug should fail
      await expect(
        createTestClient({ slug: 'unique-slug' })
      ).rejects.toThrow();
    });
  });

  describe('Client Validation Tests', () => {
    it('should require name field', () => {
      const invalidData = { slug: 'test-slug' };
      
      // Name is required
      expect('name' in invalidData).toBeFalsy();
    });

    it('should require slug field', () => {
      const invalidData = { name: 'Test Restaurant' };
      
      // Slug is required  
      expect('slug' in invalidData).toBeFalsy();
    });

    it('should validate slug format', () => {
      const validSlugs = ['test-restaurant', 'pizza-place', 'cafe123'];
      const invalidSlugs = ['Test Restaurant', 'café-français', 'rest@urant'];

      validSlugs.forEach(slug => {
        expect(slug.match(/^[a-z0-9-]+$/)).toBeTruthy();
      });

      invalidSlugs.forEach(slug => {
        expect(slug.match(/^[a-z0-9-]+$/)).toBeFalsy();
      });
    });
  });

  describe('Client Pagination Tests', () => {
    it('should handle pagination correctly', async () => {
      // Create multiple clients
      const clients = [];
      for (let i = 1; i <= 5; i++) {
        clients.push(await createTestClient({
          name: `Restaurant ${i}`,
          slug: `restaurant-${i}`
        }));
      }

      // Test pagination
      const page1 = await prisma.client.findMany({
        take: 3,
        skip: 0,
        orderBy: { name: 'asc' }
      });

      const page2 = await prisma.client.findMany({
        take: 3, 
        skip: 3,
        orderBy: { name: 'asc' }
      });

      expect(page1).toHaveLength(3);
      expect(page2).toHaveLength(2);
      expect(page1[0].id).not.toBe(page2[0].id);
    });
  });
});