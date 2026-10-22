import { Router } from 'express';
import {
  getStats,
  qcApprove,
  qcReturn,
  getWorkers,
  updateWorkerVerification,
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

export default router;
