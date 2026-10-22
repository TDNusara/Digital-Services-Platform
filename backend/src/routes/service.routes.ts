import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getServices,
  getServiceBySlug,
  createService,
} from '../controllers/service.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.get('/services', getServices);
router.get('/services/:slug', getServiceBySlug);

// Admin-only creation
router.post('/services', requireAuth, requireRole('ADMIN'), createService);

export default router;
