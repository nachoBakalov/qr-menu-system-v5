import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { paramsSchema, slugParamsSchema } from '../utils/validation';
import {
  getClientBySlug,
  getPublishedMenu,
  getPublishedCategories,
  getPublishedMenuItems,
  generateQRCode,
  getQRCode
} from '../controllers/publicController';

const router = Router();

// Public routes (no authentication required)
// Get client info and full menu by slug
router.get('/menu/:slug', validate(slugParamsSchema, 'params'), getClientBySlug);

// Get published menu for client
router.get('/menu/:clientSlug/details', validate(slugParamsSchema, 'params'), getPublishedMenu);

// Get published categories for client menu
router.get('/menu/:clientSlug/categories', validate(slugParamsSchema, 'params'), getPublishedCategories);

// Get published menu items by category for client
router.get('/menu/:clientSlug/categories/:categoryId/items', getPublishedMenuItems);

// Admin routes (authentication required)
router.use(authenticate);

// Generate QR code for client menu
router.post('/qr-code/:clientId/generate', validate(paramsSchema, 'params'), generateQRCode);

// Get existing QR code for client
router.get('/qr-code/:clientId', validate(paramsSchema, 'params'), getQRCode);

export default router;