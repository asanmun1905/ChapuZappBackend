import { Router } from 'express';
import { auth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { crearCitaSchema } from './citas.schema.js';
import { disponibilidadCtrl, crearCitaCtrl } from './citas.controller.js';

const router = Router();

// Todas las rutas de citas exigen sesión (JWT)
router.use(auth);

router.get('/disponibilidad', disponibilidadCtrl);
router.post('/', requireRole('CLIENTE'), validate(crearCitaSchema), crearCitaCtrl);

export default router;
