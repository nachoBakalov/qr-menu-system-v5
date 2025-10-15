/**
 * Client Routes
 * Маршрути за управление на клиенти (ресторанти)
 */

import { Router } from 'express';
import { clientController } from '../controllers/clients';
import { authenticate, adminOnly } from '../middlewares/auth';
import { validate, validateMultiple } from '../middlewares/validation';
import {
  createClientSchema,
  updateClientSchema,
  clientParamsSchema,
  clientSlugParamsSchema,
  queryPaginationSchema
} from '../utils/validation';

const router = Router();

// Публични маршрути (за достъп до менюта)
router.get(
  '/slug/:slug',
  validate(clientSlugParamsSchema, 'params'),
  clientController.getClientBySlug
);

// Защитени маршрути (само за админи)
router.use(authenticate, adminOnly);

// GET /api/clients - Списък с всички клиенти
router.get(
  '/',
  validate(queryPaginationSchema, 'query'),
  clientController.getAllClients
);

// GET /api/clients/:id - Детайли за конкретен клиент
router.get(
  '/:id',
  validate(clientParamsSchema, 'params'),
  clientController.getClientById
);

// POST /api/clients - Създаване на нов клиент
router.post(
  '/',
  validate(createClientSchema, 'body'),
  clientController.createClient
);

// PUT /api/clients/:id - Редактиране на клиент
router.put(
  '/:id',
  validateMultiple({
    params: clientParamsSchema,
    body: updateClientSchema
  }),
  clientController.updateClient
);

// DELETE /api/clients/:id - Изтриване на клиент
router.delete(
  '/:id',
  validate(clientParamsSchema, 'params'),
  clientController.deleteClient
);

export default router;