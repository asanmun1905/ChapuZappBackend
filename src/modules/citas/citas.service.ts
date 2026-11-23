import { EstadoCita } from '@prisma/client';
import { prisma } from '../../config/db.js';
import type { CrearCitaInput, DisponibilidadQuery } from './citas.schema.js';

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

export async function crearCita(clienteId: number, { profesionalId, servicioId, inicio }: CrearCitaInput) {
  // 1. ¿El servicio existe y es de ese profesional?
  const servicio = await prisma.servicio.findFirst({
    where: { idServicio: servicioId, profesionalId },
  });
  if (!servicio) throw new HttpError(404, 'Servicio no encontrado para ese profesional');

  const fechaInicio = new Date(inicio);

  // 2. No se puede reservar en el pasado
  if (fechaInicio <= new Date()) {
    throw new HttpError(400, 'No se puede reservar en una fecha pasada');
  }

  // 3. Las franjas empiezan siempre en hora en punto
  if (fechaInicio.getUTCMinutes() !== 0 || fechaInicio.getUTCSeconds() !== 0) {
    throw new HttpError(400, 'La hora de inicio debe ser en punto, por ejemplo 09:00');
  }

  // 4. La hora pedida tiene que estar entre las franjas libres de ese día
  const fecha = fechaInicio.toISOString().slice(0, 10);
  const { franjas } = await obtenerDisponibilidad({ profesionalId, fecha });
  const libre = franjas.some((f) => f.inicio === fechaInicio.toISOString());
  if (!libre) throw new HttpError(409, 'La franja seleccionada no está disponible');

  // 5. Se crea la cita ocupando 1 hora. El profesional podrá ampliarla después.
  return prisma.cita.create({
    data: {
      clienteId,
      profesionalId,
      servicioId,
      inicio: fechaInicio,
      fin: new Date(fechaInicio.getTime() + HORA_EN_MS),
    },
  });
}
