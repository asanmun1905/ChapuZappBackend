import { Router } from 'express';
import { listarProfesionalesCtrl, obtenerProfesionalCtrl } from './profesionales.controller.js';

const router = Router();

router.get('/', listarProfesionalesCtrl);
router.get('/:id', obtenerProfesionalCtrl);

export default router;
