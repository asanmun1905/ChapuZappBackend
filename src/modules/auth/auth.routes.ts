import { Router } from 'express';
import { registerCtrl, loginCtrl } from './auth.controller.js';
import { validate } from '../../middleware/validate.js';
import { registerSchema, loginSchema } from '../users/users.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), registerCtrl);
router.post('/login', validate(loginSchema), loginCtrl);

export default router;