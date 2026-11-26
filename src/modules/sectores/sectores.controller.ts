import type { Request, Response } from 'express';
import { listarSectores } from './sectores.service.js';

export async function listarSectoresCtrl(_req: Request, res: Response) {
  try {
    const sectores = await listarSectores();
    res.json(sectores);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
