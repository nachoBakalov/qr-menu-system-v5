/**
 * Menu Item Routes
 * Всички маршрути за продукти в менютата
 */

import { Router } from 'express';
import {
  getAllMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  getMenuItemsByCategory,
  reorderMenuItem
} from '../controllers/menuItems';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  paramsSchema,
  queryPaginationSchema,
  menuItemAvailabilitySchema,
  menuItemReorderSchema,
  categoryIdParamsSchema
} from '../utils/validation';

const router = Router();

/**
 * GET /api/menu-items/category/:categoryId
 * Публичен endpoint - връща продукти за категория (за QR кодовете)
 */
router.get(
  '/category/:categoryId',
  validate(categoryIdParamsSchema, 'params'),
  getMenuItemsByCategory
);

// Останалите routes изискват authentication
router.use(authenticate);

/**
 * GET /api/menu-items
 * Връща всички продукти с пагинация и филтри
 */
router.get(
  '/',
  validate(queryPaginationSchema, 'query'),
  getAllMenuItems
);

/**
 * GET /api/menu-items/:id
 * Връща детайли за конкретен продукт
 */
router.get(
  '/:id',
  validate(paramsSchema, 'params'),
  getMenuItemById
);

/**
 * POST /api/menu-items
 * Създава нов продукт
 */
router.post(
  '/',
  validate(createMenuItemSchema, 'body'),
  createMenuItem
);

/**
 * PUT /api/menu-items/:id
 * Редактира съществуващ продукт
 */
router.put(
  '/:id',
  validate(paramsSchema, 'params'),
  validate(updateMenuItemSchema, 'body'),
  updateMenuItem
);

/**
 * DELETE /api/menu-items/:id
 * Изтрива продукт
 */
router.delete(
  '/:id',
  validate(paramsSchema, 'params'),
  deleteMenuItem
);

/**
 * PUT /api/menu-items/:id/availability
 * Променя наличността на продукт (бързо включване/изключване)
 */
router.put(
  '/:id/availability',
  validate(paramsSchema, 'params'),
  validate(menuItemAvailabilitySchema, 'body'),
  toggleMenuItemAvailability
);

/**
 * PUT /api/menu-items/:id/reorder
 * Променя позицията на продукт в категорията
 */
router.put(
  '/:id/reorder',
  validate(paramsSchema, 'params'),
  validate(menuItemReorderSchema, 'body'),
  reorderMenuItem
);

export default router;