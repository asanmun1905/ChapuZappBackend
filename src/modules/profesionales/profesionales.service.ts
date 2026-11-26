import type { Prisma } from '@prisma/client';
import { prisma } from '../../config/db.js';
import { HttpError } from '../citas/citas.service.js';
import type { ListarProfesionalesQuery } from './profesionales.schema.js';

export async function listarProfesionales(query: ListarProfesionalesQuery) {
  const { q, sectorId, sector, precioMax, valoracionMin, orden, page, limit } = query;

  const where: Prisma.ProfesionalWhereInput = {};

  if (sectorId !== undefined) {
    where.sectorId = sectorId;
  }

  if (sector !== undefined) {
    where.sector = {
      nombre: { equals: sector, mode: 'insensitive' },
    };
  }

  if (valoracionMin !== undefined) {
    where.valoracionMedia = { gte: valoracionMin };
  }

  if (precioMax !== undefined) {
    where.servicios = {
      some: {
        precio: { lte: precioMax },
      },
    };
  }

  if (q !== undefined) {
    where.OR = [
      { usuario: { nombre: { contains: q, mode: 'insensitive' } } },
      { descripcion: { contains: q, mode: 'insensitive' } },
      { direccion: { contains: q, mode: 'insensitive' } },
      { sector: { nombre: { contains: q, mode: 'insensitive' } } },
      {
        servicios: {
          some: {
            OR: [
              { nombre: { contains: q, mode: 'insensitive' } },
              { descripcion: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  let orderBy: Prisma.ProfesionalOrderByWithRelationInput[];
  switch (orden) {
    case 'nombre':
      orderBy = [{ usuario: { nombre: 'asc' } }, { idProfesional: 'asc' }];
      break;
    case 'recientes':
      orderBy = [{ creadoEn: 'desc' }, { idProfesional: 'asc' }];
      break;
    case 'valoracion':
    default:
      orderBy = [{ valoracionMedia: 'desc' }, { idProfesional: 'asc' }];
      break;
  }

  const skip = (page - 1) * limit;

  const [profesionales, total] = await prisma.$transaction([
    prisma.profesional.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        idProfesional: true,
        descripcion: true,
        direccion: true,
        valoracionMedia: true,
        creadoEn: true,
        usuario: {
          select: {
            nombre: true,
            ciudad: true,
            foto: true,
          },
        },
        sector: {
          select: {
            idSector: true,
            nombre: true,
          },
        },
        servicios: {
          orderBy: { precio: 'asc' },
          select: {
            idServicio: true,
            nombre: true,
            precio: true,
            duracionMin: true,
          },
        },
      },
    }),
    prisma.profesional.count({ where }),
  ]);

  return {
    data: profesionales.map((p) => ({
      idProfesional: p.idProfesional,
      nombre: p.usuario.nombre,
      ciudad: p.usuario.ciudad,
      foto: p.usuario.foto,
      sector: p.sector,
      descripcion: p.descripcion,
      direccion: p.direccion,
      valoracionMedia: p.valoracionMedia,
      servicios: p.servicios.map((s) => ({
        ...s,
        precio: Number(s.precio),
      })),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function obtenerProfesionalPorId(idProfesional: number) {
  const profesional = await prisma.profesional.findUnique({
    where: { idProfesional },
    select: {
      idProfesional: true,
      descripcion: true,
      direccion: true,
      valoracionMedia: true,
      creadoEn: true,
      usuario: {
        select: {
          nombre: true,
          telefono: true,
          ciudad: true,
          foto: true,
        },
      },
      sector: {
        select: {
          idSector: true,
          nombre: true,
        },
      },
      servicios: {
        orderBy: { precio: 'asc' },
        select: {
          idServicio: true,
          nombre: true,
          descripcion: true,
          precio: true,
          duracionMin: true,
        },
      },
      horarios: {
        orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
        select: {
          idHorario: true,
          diaSemana: true,
          horaInicio: true,
          horaFin: true,
        },
      },
    },
  });

  if (!profesional) {
    throw new HttpError(404, 'Profesional no encontrado');
  }

  return {
    idProfesional: profesional.idProfesional,
    nombre: profesional.usuario.nombre,
    telefono: profesional.usuario.telefono,
    ciudad: profesional.usuario.ciudad,
    foto: profesional.usuario.foto,
    sector: profesional.sector,
    descripcion: profesional.descripcion,
    direccion: profesional.direccion,
    valoracionMedia: profesional.valoracionMedia,
    creadoEn: profesional.creadoEn,
    servicios: profesional.servicios.map((s) => ({
      ...s,
      precio: Number(s.precio),
    })),
    horarios: profesional.horarios,
  };
}
