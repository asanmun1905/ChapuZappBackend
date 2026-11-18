import { Router } from 'express';
import { auth } from '../../middleware/auth.js';

const router = Router();

router.use(auth);

export default router;