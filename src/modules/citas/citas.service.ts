import { EstadoCita } from '@prisma/client';
import { prisma } from '../../config/db.js';
import type { DisponibilidadQuery } from './citas.schema.js';

// Error que lleva también el código HTTP (404, 400...).
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const HORA_EN_MS = 60 * 60 * 1000;

export async function obtenerDisponibilidad({ profesionalId, fecha }: DisponibilidadQuery) {
  // 1. ¿Existe el profesional?
  const profesional = await prisma.profesional.findUnique({
    where: { idProfesional: profesionalId },
  });
  if (!profesional) throw new HttpError(404, 'Profesional no encontrado');

  // 2. ¿Qué día de la semana es esa fecha? (0 = domingo, 1 = lunes ... 6 = sábado)
  const inicioDia = new Date(`${fecha}T00:00:00Z`);
  const finDia = new Date(inicioDia.getTime() + 24 * HORA_EN_MS);
  const diaSemana = inicioDia.getUTCDay();

  // 3. Turnos en los que trabaja ese día (por ejemplo 09:00-14:00 y 16:00-19:00)
  const turnos = await prisma.horario.findMany({
    where: { profesionalId, diaSemana },
    orderBy: { horaInicio: 'asc' },
  });

  // 4. Citas que ya tiene cogidas ese día (las canceladas no cuentan)
  const citas = await prisma.cita.findMany({
    where: {
      profesionalId,
      estado: EstadoCita.PROGRAMADA,
      inicio: { gte: inicioDia, lt: finDia },
    },
  });

  // 5. Recorremos cada turno hora a hora y nos quedamos con las horas libres
  const ahora = new Date();
  const franjas: { inicio: string; fin: string }[] = [];

  for (const turno of turnos) {
    const horaInicio = Number(turno.horaInicio.slice(0, 2)); // "09:00" -> 9
    const horaFin = Number(turno.horaFin.slice(0, 2)); // "14:00" -> 14

    for (let hora = horaInicio; hora < horaFin; hora++) {
      const inicio = new Date(`${fecha}T${String(hora).padStart(2, '0')}:00:00Z`);
      const fin = new Date(inicio.getTime() + HORA_EN_MS);

      const yaPaso = inicio <= ahora;
      const ocupada = citas.some((c) => inicio < c.fin && fin > c.inicio);

      if (!yaPaso && !ocupada) {
        franjas.push({ inicio: inicio.toISOString(), fin: fin.toISOString() });
      }
    }
  }

  return { profesionalId, fecha, franjas };
}