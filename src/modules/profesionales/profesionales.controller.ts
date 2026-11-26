import type { Request, Response } from 'express';
import { listarProfesionalesQuerySchema, idParamSchema } from './profesionales.schema.js';
import { listarProfesionales, obtenerProfesionalPorId } from './profesionales.service.js';
import { HttpError } from '../citas/citas.service.js';

export async function listarProfesionalesCtrl(req: Request, res: Response) {
  const parsed = listarProfesionalesQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const result = await listarProfesionales(parsed.data);
    res.json(result);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function obtenerProfesionalCtrl(req: Request, res: Response) {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const profesional = await obtenerProfesionalPorId(parsed.data.id);
    res.json(profesional);
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.status).json({ message: e.message });
    }
    console.error(e);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
