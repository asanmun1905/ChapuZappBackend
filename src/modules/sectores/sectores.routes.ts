import { Router } from 'express';
import { listarSectoresCtrl } from './sectores.controller.js';

const router = Router();

router.get('/', listarSectoresCtrl);

export default router;
