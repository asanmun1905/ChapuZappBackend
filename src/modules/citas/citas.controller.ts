import type { Request, Response } from 'express';
import { disponibilidadQuerySchema } from './citas.schema.js';
import { obtenerDisponibilidad, HttpError } from './citas.service.js';

export async function disponibilidadCtrl(req: Request, res: Response) {
  const parsed = disponibilidadQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const data = await obtenerDisponibilidad(parsed.data);
    res.json(data);
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.status).json({ message: e.message });
    }
    console.error(e);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}