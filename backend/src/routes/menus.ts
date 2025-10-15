/**
 * Menu Routes
 * Всички маршрути за менюта
 */

import { Router } from 'express';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  publishMenu,
  unpublishMenu
} from '../controllers/menus';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import {
  createMenuSchema,
  updateMenuSchema,
  menuParamsSchema,
  queryPaginationSchema
} from '../utils/validation';

const router = Router();

// Всички routes изискват authentication (само админи могат да управляват менютата)
router.use(authenticate);

/**
 * GET /api/menus
 * Връща всички менюта с пагинация
 */
router.get(
  '/',
  validate(queryPaginationSchema, 'query'),
  getAllMenus
);

/**
 * GET /api/menus/:id
 * Връща детайли за конкретно меню
 */
router.get(
  '/:id',
  validate(menuParamsSchema, 'params'),
  getMenuById
);

/**
 * POST /api/menus
 * Създава ново меню за клиент
 */
router.post(
  '/',
  validate(createMenuSchema, 'body'),
  createMenu
);

/**
 * PUT /api/menus/:id
 * Редактира съществуващо меню
 */
router.put(
  '/:id',
  validate(menuParamsSchema, 'params'),
  validate(updateMenuSchema, 'body'),
  updateMenu
);

/**
 * DELETE /api/menus/:id
 * Изтрива меню и всичките му данни
 */
router.delete(
  '/:id',
  validate(menuParamsSchema, 'params'),
  deleteMenu
);

/**
 * POST /api/menus/:id/publish
 * Публикува меню (прави го достъпно за QR код)
 */
router.post(
  '/:id/publish',
  validate(menuParamsSchema, 'params'),
  publishMenu
);

/**
 * POST /api/menus/:id/unpublish
 * Скрива меню от публичен достъп
 */
router.post(
  '/:id/unpublish',
  validate(menuParamsSchema, 'params'),
  unpublishMenu
);

export default router;