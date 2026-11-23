import { Router } from 'express';
import { auth, requireRole } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { crearCitaSchema } from './citas.schema.js';
import { disponibilidadCtrl, crearCitaCtrl, misCitasCtrl, cancelarCitaCtrl } from './citas.controller.js';

const router = Router();

// Todas las rutas de citas exigen sesión (JWT)
router.use(auth);

router.get('/disponibilidad', disponibilidadCtrl);
router.get('/mias', misCitasCtrl);
router.post('/', requireRole('CLIENTE'), validate(crearCitaSchema), crearCitaCtrl);
router.patch('/:id/cancelar', cancelarCitaCtrl);

export default router;