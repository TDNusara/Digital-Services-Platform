import { Router } from 'express';
import { createReview, getWorkerReviews } from '../controllers/review.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/worker/:workerId', getWorkerReviews);
router.post('/:orderId', requireAuth, requireRole('CUSTOMER'), createReview);

export default router;
