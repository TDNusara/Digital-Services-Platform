import { Router } from 'express';
import { uploadOrderFile, downloadFile } from '../controllers/file.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

router.use(requireAuth);

router.post('/upload/:orderId', uploadMiddleware.single('file'), uploadOrderFile);
router.get('/download/:fileId', downloadFile);

export default router;
