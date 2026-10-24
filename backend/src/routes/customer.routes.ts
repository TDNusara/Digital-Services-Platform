import { Router } from 'express';
import { getCustomerProfile, updateCustomerProfile } from '../controllers/customer.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole('CUSTOMER'));

router.get('/profile', getCustomerProfile);
router.put('/profile', updateCustomerProfile);

export default router;
