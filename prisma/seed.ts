import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, Rol } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const passwordHash = await bcrypt.hash('Chapuzapp123', saltRounds);

  await prisma.usuario.upsert({
    where: { email: 'cliente@chapuzapp.test' },
    update: {},
    create: {
      nombre: 'Cliente de prueba',
      email: 'cliente@chapuzapp.test',
      passwordHash,
      rol: Rol.CLIENTE,
    },
  });

  await prisma.usuario.upsert({
    where: { email: 'profesional@chapuzapp.test' },
    update: {},
    create: {
      nombre: 'Profesional de prueba',
      email: 'profesional@chapuzapp.test',
      passwordHash,
      rol: Rol.PROFESIONAL,
    },
  });

  console.log('Seed completado: 1 cliente y 1 profesional');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });