import { z } from 'zod';

// POST /api/citas (llega en el body, en JSON)
export const crearCitaSchema = z
  .object({
    profesionalId: z
      .number({ message: 'El profesional es obligatorio' })
      .int()
      .positive('Profesional inválido'),
    servicioId: z
      .number({ message: 'El servicio es obligatorio' })
      .int()
      .positive('Servicio inválido'),
    inicio: z.iso.datetime({
      message: 'El inicio debe ser una fecha ISO en UTC, por ejemplo 2026-12-01T09:00:00Z',
    }),
  })
  .strict();

// GET /api/citas/disponibilidad (llega en la query, siempre como texto)
export const disponibilidadQuerySchema = z.object({
  profesionalId: z.coerce.number({ message: 'Profesional inválido' }).int().positive('Profesional inválido'),
  fecha: z.iso.date({ message: 'La fecha debe tener el formato AAAA-MM-DD' }),
});

// GET /api/citas/mias (query opcional)
export const misCitasQuerySchema = z.object({
  tipo: z.enum(['proximas', 'pasadas'], { message: 'El tipo debe ser proximas o pasadas' }).optional(),
});

// PATCH /api/citas/:id/cancelar (llega en la ruta, como texto)
export const idParamSchema = z.object({
  id: z.coerce.number({ message: 'ID inválido' }).int().positive('ID inválido'),
});

export type CrearCitaInput = z.infer<typeof crearCitaSchema>;
export type DisponibilidadQuery = z.infer<typeof disponibilidadQuerySchema>;
export type MisCitasQuery = z.infer<typeof misCitasQuerySchema>;