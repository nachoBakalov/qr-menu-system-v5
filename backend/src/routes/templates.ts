/**
 * Template Routes
 * Маршрути за управление на темплейти
 */

import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validation';
import { paramsSchema } from '../utils/validation';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../controllers/templateController';

const router = Router();

// Public routes - get templates
router.get('/', getAllTemplates);
router.get('/:id', validate(paramsSchema, 'params'), getTemplateById);

// Admin routes - manage templates
router.use(authenticate);
router.post('/', createTemplate);
router.put('/:id', validate(paramsSchema, 'params'), updateTemplate);
router.delete('/:id', validate(paramsSchema, 'params'), deleteTemplate);

export default router;