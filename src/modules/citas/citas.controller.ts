import type { Request, Response } from 'express';
import { disponibilidadQuerySchema, misCitasQuerySchema, idParamSchema } from './citas.schema.js';
import { obtenerDisponibilidad, crearCita, listarMisCitas, cancelarCita, HttpError } from './citas.service.js';

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

export async function crearCitaCtrl(req: Request, res: Response) {
  try {
    const clienteId = Number(req.user!.sub);
    const cita = await crearCita(clienteId, req.body);
    res.status(201).json(cita);
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.status).json({ message: e.message });
    }
    console.error(e);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function misCitasCtrl(req: Request, res: Response) {
  const parsed = misCitasQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const clienteId = Number(req.user!.sub);
    const citas = await listarMisCitas(clienteId, parsed.data);
    res.json(citas);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

export async function cancelarCitaCtrl(req: Request, res: Response) {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const clienteId = Number(req.user!.sub);
    const cita = await cancelarCita(clienteId, parsed.data.id);
    res.json(cita);
  } catch (e: any) {
    if (e instanceof HttpError) {
      return res.status(e.status).json({ message: e.message });
    }
    console.error(e);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
