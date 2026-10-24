import { Router } from 'express';
import {
  initiatePayment,
  payhereWebhook,
  mockSandboxPayment,
  getCustomerTransactions,
} from '../controllers/payment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Public server-to-server webhook
router.post('/payhere-webhook', payhereWebhook);

// Customer endpoints
router.get('/transactions', requireAuth, requireRole('CUSTOMER'), getCustomerTransactions);
router.post('/initiate/:orderId', requireAuth, requireRole('CUSTOMER'), initiatePayment);
router.post('/sandbox-mock-pay/:orderId', requireAuth, requireRole('CUSTOMER'), mockSandboxPayment);

export default router;
