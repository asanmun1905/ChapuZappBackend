import { prisma } from '../../config/db.js';

export async function listarSectores() {
  return prisma.sector.findMany({
    orderBy: { nombre: 'asc' },
    select: {
      idSector: true,
      nombre: true,
    },
  });
}
