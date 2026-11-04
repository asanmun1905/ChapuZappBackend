import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { createUser, findUserByEmail } from '../users/users.service.js';
import type { Rol } from '@prisma/client';

export async function register(nombre: string, email: string, password: string, rol: Rol) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error('Email ya registrado');
  }

  const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  return createUser(nombre, email, hash, rol);
}

export async function login(email: string, password: string) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error('Credenciales inválidas');
  }
  
  const token = jwt.sign({ sub: user.idUsuario, email: user.email }, env.JWT_SECRET, { expiresIn: '7d' });
  
  return { 
    user: { 
      id: user.idUsuario, 
      email: user.email, 
      name: user.nombre,
      createdAt: user.creadoEn
    }, 
    token 
  };
}

