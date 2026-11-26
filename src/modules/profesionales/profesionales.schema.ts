import { z } from 'zod';

export const listarProfesionalesQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  sectorId: z.coerce.number({ message: 'sectorId inválido' }).int().positive('sectorId inválido').optional(),
  sector: z.string().trim().min(1).optional(),
  precioMax: z.coerce.number({ message: 'precioMax inválido' }).positive('precioMax debe ser mayor que 0').optional(),
  valoracionMin: z.coerce
    .number({ message: 'valoracionMin inválida' })
    .min(0, 'valoracionMin debe estar entre 0 y 5')
    .max(5, 'valoracionMin debe estar entre 0 y 5')
    .optional(),
  orden: z
    .enum(['valoracion', 'nombre', 'recientes'], {
      message: 'El orden debe ser valoracion, nombre o recientes',
    })
    .default('valoracion'),
  page: z.coerce.number({ message: 'page inválido' }).int().min(1, 'page debe ser al menos 1').default(1),
  limit: z.coerce
    .number({ message: 'limit inválido' })
    .int()
    .min(1, 'limit debe ser al menos 1')
    .max(50, 'limit no puede superar 50')
    .default(10),
});

export const idParamSchema = z.object({
  id: z.coerce.number({ message: 'ID inválido' }).int().positive('ID inválido'),
});

export type ListarProfesionalesQuery = z.infer<typeof listarProfesionalesQuerySchema>;
