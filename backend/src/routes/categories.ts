/**
 * Category Routes
 * Всички маршрути за категории
 */

import { Router } from 'express';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategory,
  getCategoriesForReorder,
  getCategoriesByMenu
} from '../controllers/categories';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import {
  createCategorySchema,
  updateCategorySchema,
  paramsSchema,
  queryPaginationSchema,
  categoryReorderSchema,
  menuIdParamsSchema
} from '../utils/validation';

const router = Router();

/**
 * GET /api/categories/menu/:menuId
 * Публичен endpoint - връща категории за меню (за QR кодовете)
 */
router.get(
  '/menu/:menuId',
  validate(menuIdParamsSchema, 'params'),
  getCategoriesByMenu
);

/**
 * GET /api/categories/reorder/:menuId
 * Админ endpoint - връща категории с информация за подредба
 */
router.get(
  '/reorder/:menuId',
  authenticate,
  validate(menuIdParamsSchema, 'params'),
  getCategoriesForReorder
);

// Останалите routes изискват authentication
router.use(authenticate);

/**
 * GET /api/categories
 * Връща всички категории с пагинация
 */
router.get(
  '/',
  validate(queryPaginationSchema, 'query'),
  getAllCategories
);

/**
 * GET /api/categories/:id
 * Връща детайли за конкретна категория
 */
router.get(
  '/:id',
  validate(paramsSchema, 'params'),
  getCategoryById
);

/**
 * POST /api/categories
 * Създава нова категория
 */
router.post(
  '/',
  validate(createCategorySchema, 'body'),
  createCategory
);

/**
 * PUT /api/categories/:id
 * Редактира съществуваща категория
 */
router.put(
  '/:id',
  validate(paramsSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  updateCategory
);

/**
 * DELETE /api/categories/:id
 * Изтрива категория и всичките ѝ продукти
 */
router.delete(
  '/:id',
  validate(paramsSchema, 'params'),
  deleteCategory
);

/**
 * PUT /api/categories/:id/reorder
 * Променя позицията на категория (директно задаване на позиция)
 */
router.put(
  '/:id/reorder',
  validate(paramsSchema, 'params'),
  validate(categoryReorderSchema, 'body'),
  reorderCategory
);

export default router;