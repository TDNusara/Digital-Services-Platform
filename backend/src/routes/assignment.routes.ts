import { Router } from 'express';
import {
  assignWorker,
  acceptAssignment,
  declineAssignment,
  submitWork,
  getMyTasks,
} from '../controllers/assignment.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.use(requireAuth);

router.get('/my-tasks', requireRole('WORKER'), getMyTasks);
router.post('/assign', requireRole('ADMIN'), assignWorker);
router.post('/:id/accept', requireRole('WORKER'), acceptAssignment);
router.post('/:id/decline', requireRole('WORKER'), declineAssignment);
router.post('/:orderId/submit-work', requireRole('WORKER'), uploadMiddleware.array('files', 10), submitWork);

export default router;
