import { Router } from 'express';
import {
  getStats,
  qcApprove,
  qcReturn,
  getWorkers,
  updateWorkerVerification,
  getEscrowOverview,
  updateOrderPricingBreakdown,
  releaseEscrow,
  refundEscrow,
} from '../controllers/admin.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

router.get('/stats', getStats);
router.get('/workers', getWorkers);
router.put('/workers/:workerId/status', updateWorkerVerification);
router.post('/orders/:orderId/qc-approve', qcApprove);
router.post('/orders/:orderId/qc-return', qcReturn);

// Escrow & Pricing Management
router.get('/escrow', getEscrowOverview);
router.put('/orders/:orderId/pricing', updateOrderPricingBreakdown);
router.post('/orders/:orderId/escrow/release', releaseEscrow);
router.post('/orders/:orderId/escrow/refund', refundEscrow);

export default router;

