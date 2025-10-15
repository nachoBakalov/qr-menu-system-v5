import Joi from 'joi';
import { 
  loginSchema, 
  createClientSchema, 
  updateClientSchema,
  createMenuSchema,
  createCategorySchema,
  createMenuItemSchema 
} from '../src/utils/validation';

describe('Validation Schema Tests', () => {
  
  describe('Login Validation', () => {
    it('should validate correct login data', () => {
      const validLogin = {
        email: 'admin@test.com',
        password: 'password123'
      };

      const { error } = loginSchema.validate(validLogin);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email format', () => {
      const invalidLogin = {
        email: 'invalid-email',
        password: 'password123'
      };

      const { error } = loginSchema.validate(invalidLogin);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('email');
    });

    it('should reject empty password', () => {
      const invalidLogin = {
        email: 'admin@test.com',
        password: ''
      };

      const { error } = loginSchema.validate(invalidLogin);
      expect(error).toBeDefined();
      expect(error?.details[0].path).toContain('password');
    });
  });

  describe('Client Validation', () => {
    it('should validate correct client data', () => {
      const validClient = {
        name: 'Test Restaurant',
        slug: 'test-restaurant',
        description: 'A great place to eat',
        address: '123 Main Street',
        phone: '+359888123456'
      };

      const { error } = createClientSchema.validate(validClient);
      expect(error).toBeUndefined();
    });

    it('should reject invalid slug format', () => {
      const invalidClient = {
        name: 'Test Restaurant',
        slug: 'Test Restaurant', // Should be lowercase with dashes
        description: 'A great place'
      };

      const { error } = createClientSchema.validate(invalidClient);
      expect(error).toBeDefined();
    });

    it('should reject too short name', () => {
      const invalidClient = {
        name: 'T', // Too short
        slug: 'test'
      };

      const { error } = createClientSchema.validate(invalidClient);
      expect(error).toBeDefined();
    });
  });

  describe('Menu Validation', () => {
    it('should validate correct menu data', () => {
      const validMenu = {
        name: 'Main Menu',
        clientId: 123
      };

      const { error } = createMenuSchema.validate(validMenu);
      expect(error).toBeUndefined();
    });

    it('should require name field', () => {
      const invalidMenu = {
        clientId: 123
      };

      const { error } = createMenuSchema.validate(invalidMenu);
      expect(error).toBeDefined();
    });
  });

  describe('Category Validation', () => {
    it('should validate correct category data', () => {
      const validCategory = {
        name: 'Appetizers',
        description: 'Start your meal right',
        menuId: 123,
        order: 1
      };

      const { error } = createCategorySchema.validate(validCategory);
      expect(error).toBeUndefined();
    });

    it('should validate without optional fields', () => {
      const minimalCategory = {
        name: 'Main Courses',
        menuId: 123
      };

      const { error } = createCategorySchema.validate(minimalCategory);
      expect(error).toBeUndefined();
    });
  });

  describe('MenuItem Validation', () => {
    it('should validate correct menu item data', () => {
      const validMenuItem = {
        name: 'Grilled Salmon',
        description: 'Fresh salmon grilled to perfection',
        priceBGN: 24.50,
        priceEUR: 12.50,
        categoryId: 123,
        menuId: 456,
        weight: 300,
        weightUnit: 'g',
        tags: ['fish', 'grilled', 'healthy'],
        allergens: ['fish'],
        available: true
      };

      const { error } = createMenuItemSchema.validate(validMenuItem);
      expect(error).toBeUndefined();
    });

    it('should require both BGN and EUR prices', () => {
      const invalidMenuItem = {
        name: 'Test Item',
        priceBGN: 10.00,
        // Missing priceEUR
        categoryId: 123,
        menuId: 456
      };

      const { error } = createMenuItemSchema.validate(invalidMenuItem);
      expect(error).toBeDefined();
    });

    it('should validate price ranges', () => {
      const invalidMenuItem = {
        name: 'Expensive Item',
        priceBGN: -5.00, // Negative price should be invalid
        priceEUR: 10.00,
        categoryId: 123,
        menuId: 456
      };

      const { error } = createMenuItemSchema.validate(invalidMenuItem);
      expect(error).toBeDefined();
    });

    it('should validate tags array', () => {
      const validMenuItem = {
        name: 'Test Item',
        priceBGN: 10.00,
        priceEUR: 5.00,
        categoryId: 123,
        menuId: 456,
        tags: ['vegan', 'organic', 'spicy']
      };

      const { error } = createMenuItemSchema.validate(validMenuItem);
      expect(error).toBeUndefined();
    });

    it('should validate allergens array', () => {
      const validMenuItem = {
        name: 'Pasta Dish',
        priceBGN: 15.00,
        priceEUR: 7.50,
        categoryId: 123,
        menuId: 456,
        allergens: ['gluten', 'eggs', 'dairy']
      };

      const { error } = createMenuItemSchema.validate(validMenuItem);
      expect(error).toBeUndefined();
    });
  });

  describe('Custom Validation Rules', () => {
    it('should validate decimal precision for prices', () => {
      const validPrices = [10.00, 15.50, 99.99, 0.01];
      const invalidPrices = [10.123, 15.555]; // Too many decimal places

      const schema = Joi.number().precision(2).positive();

      validPrices.forEach(price => {
        const { error } = schema.validate(price);
        expect(error).toBeUndefined();
      });

      invalidPrices.forEach(price => {
        const { error } = schema.validate(price);
        expect(error).toBeDefined();
      });
    });
  });
});