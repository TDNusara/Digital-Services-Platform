import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
} from '../controllers/service.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Public catalog routes
router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/services', getServices);
router.get('/services/:slug', getServiceBySlug);

// Admin-only service management routes
router.post('/services', requireAuth, requireRole('ADMIN'), createService);
router.put('/services/:id', requireAuth, requireRole('ADMIN'), updateService);
router.delete('/services/:id', requireAuth, requireRole('ADMIN'), deleteService);

export default router;
