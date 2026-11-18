import { Router } from 'express';
import { auth } from '../../middleware/auth.js';
import { disponibilidadCtrl } from './citas.controller.js';

const router = Router();

// Todas las rutas de citas exigen sesión (JWT)
router.use(auth);

router.get('/disponibilidad', disponibilidadCtrl);

export default router;