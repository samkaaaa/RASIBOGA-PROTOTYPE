import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { handleUpload, uploadSingle } from '../middleware/upload.js';

const router = Router();

router.post('/', protect, uploadSingle('file'), handleUpload);

export default router;
