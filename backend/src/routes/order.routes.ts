import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  sendQuotation,
  acceptQuotation,
  requestRevision,
  completeOrder,
} from '../controllers/order.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('CUSTOMER'), uploadMiddleware.array('files', 5), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

// Quotation
router.post('/:id/quote', requireRole('ADMIN'), sendQuotation);
router.post('/:id/accept-quote', requireRole('CUSTOMER'), acceptQuotation);

// Customer Revision & Completion
router.post('/:id/revision', requireRole('CUSTOMER'), requestRevision);
router.post('/:id/complete', requireRole('CUSTOMER'), completeOrder);

export default router;
