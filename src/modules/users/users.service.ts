import { prisma } from '../../config/db.js';
import type { Rol } from '@prisma/client';

// Campos que devolvemos al exterior. passwordHash NO está: nunca sale de la API.
const camposPublicos = {
  idUsuario: true,
  nombre: true,
  email: true,
  rol: true,
  creadoEn: true,
};

export async function createUser(nombre: string, email: string, passwordHash: string, rol: Rol) {
  return prisma.usuario.create({
    data: { nombre, email, passwordHash, rol },
    select: camposPublicos,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.usuario.findUnique({ where: { email } });
}

export async function findUserById(idUsuario: number) {
  return prisma.usuario.findUnique({
    where: { idUsuario },
    select: camposPublicos,
  });
}

export async function listUsers() {
  return prisma.usuario.findMany({
    select: camposPublicos,
    orderBy: { idUsuario: 'asc' },
  });
}

export async function updateUser(idUsuario: number, data: { nombre?: string; email?: string }) {
  return prisma.usuario.update({
    where: { idUsuario },
    data,
    select: camposPublicos,
  });
}

export async function deleteUser(idUsuario: number) {
  return prisma.usuario.delete({ where: { idUsuario } });
}