import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient, Rol, EstadoCita } from '@prisma/client';

const prisma = new PrismaClient();

const SECTORES = ['Fontanería', 'Electricidad', 'Limpieza', 'Carpintería'];

const CLIENTES = [
  { email: 'cliente@chapuzapp.test', nombre: 'Cliente de prueba', telefono: '600000001' },
  { email: 'lucia.garcia@chapuzapp.test', nombre: 'Lucía García', telefono: '600000002' },
];

const PROFESIONALES = [
  {
    email: 'profesional@chapuzapp.test',
    nombre: 'Antonio Ruiz',
    telefono: '611000001',
    sector: 'Fontanería',
    descripcion: 'Fontanero con 15 años de experiencia en el centro de Málaga.',
    direccion: 'Calle Larios 10, Málaga',
    servicios: [
      { nombre: 'Reparación de fugas', descripcion: 'Localización y arreglo de fugas de agua.', precio: 45, duracionMin: 60 },
      { nombre: 'Desatasco de tuberías', descripcion: 'Desatasco de fregaderos, duchas y bajantes.', precio: 60, duracionMin: 90 },
    ],
  },
  {
    email: 'marta.lopez@chapuzapp.test',
    nombre: 'Marta López',
    telefono: '611000002',
    sector: 'Electricidad',
    descripcion: 'Electricista instaladora autorizada en Teatinos y alrededores.',
    direccion: 'Calle Doctor Ortiz Ramos 5, Málaga',
    servicios: [
      { nombre: 'Revisión de instalación eléctrica', descripcion: 'Revisión del cuadro y de los enchufes.', precio: 50, duracionMin: 60 },
      { nombre: 'Instalación de punto de luz', descripcion: 'Nuevo punto de luz o enchufe.', precio: 35, duracionMin: 45 },
    ],
  },
  {
    email: 'carmen.sanchez@chapuzapp.test',
    nombre: 'Carmen Sánchez',
    telefono: '611000003',
    sector: 'Limpieza',
    descripcion: 'Limpieza de hogares y oficinas en Pedregalejo y El Palo.',
    direccion: 'Calle Bruselas 20, Málaga',
    servicios: [
      { nombre: 'Limpieza general del hogar', descripcion: 'Limpieza de todas las estancias.', precio: 40, duracionMin: 120 },
      { nombre: 'Limpieza a fondo', descripcion: 'Limpieza profunda de cocina y baños.', precio: 70, duracionMin: 180 },
    ],
  },
  {
    email: 'javier.moreno@chapuzapp.test',
    nombre: 'Javier Moreno',
    telefono: '611000004',
    sector: 'Carpintería',
    descripcion: 'Carpintero de muebles a medida en Huelin.',
    direccion: 'Calle Eduardo Domínguez Ávila 8, Málaga',
    servicios: [
      { nombre: 'Montaje de muebles', descripcion: 'Montaje de muebles de cualquier tienda.', precio: 30, duracionMin: 90 },
      { nombre: 'Reparación de puertas', descripcion: 'Ajuste y reparación de puertas y bisagras.', precio: 40, duracionMin: 60 },
    ],
  },
];

// diaSemana: 1 = lunes ... 5 = viernes. Mismo horario para todos los profesionales.
const DIAS = [1, 2, 3, 4, 5];
const TURNOS = [
  { horaInicio: '09:00', horaFin: '14:00' },
  { horaInicio: '16:00', horaFin: '19:00' },
];

// Fechas fijas para que el seed deje siempre los mismos datos.
const CITAS = [
  { cliente: 'cliente@chapuzapp.test', profesional: 'profesional@chapuzapp.test', servicio: 'Reparación de fugas', inicio: '2026-12-01T09:00:00Z', estado: EstadoCita.PROGRAMADA },
  { cliente: 'lucia.garcia@chapuzapp.test', profesional: 'marta.lopez@chapuzapp.test', servicio: 'Revisión de instalación eléctrica', inicio: '2026-12-02T10:00:00Z', estado: EstadoCita.PROGRAMADA },
  { cliente: 'cliente@chapuzapp.test', profesional: 'carmen.sanchez@chapuzapp.test', servicio: 'Limpieza general del hogar', inicio: '2026-12-03T09:00:00Z', estado: EstadoCita.PROGRAMADA },
  { cliente: 'lucia.garcia@chapuzapp.test', profesional: 'javier.moreno@chapuzapp.test', servicio: 'Montaje de muebles', inicio: '2026-12-04T16:00:00Z', estado: EstadoCita.CANCELADA },
];

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);
  const passwordHash = await bcrypt.hash('Chapuzapp123', saltRounds);

  // 1. Sectores
  const sectorIds: Record<string, number> = {};
  for (const nombre of SECTORES) {
    const sector = await prisma.sector.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    sectorIds[nombre] = sector.idSector;
  }

  // 2. Clientes
  const clienteIds: Record<string, number> = {};
  for (const c of CLIENTES) {
    const usuario = await prisma.usuario.upsert({
      where: { email: c.email },
      update: {},
      create: {
        nombre: c.nombre,
        email: c.email,
        passwordHash,
        rol: Rol.CLIENTE,
        telefono: c.telefono,
        ciudad: 'Málaga',
      },
    });
    clienteIds[c.email] = usuario.idUsuario;
  }

  // 3. Profesionales con sus servicios y horarios
  const profesionalIds: Record<string, number> = {};
  const servicioIds: Record<string, number> = {};
  const servicioDuracion: Record<string, number> = {};

  for (const p of PROFESIONALES) {
    const usuario = await prisma.usuario.upsert({
      where: { email: p.email },
      update: {},
      create: {
        nombre: p.nombre,
        email: p.email,
        passwordHash,
        rol: Rol.PROFESIONAL,
        telefono: p.telefono,
        ciudad: 'Málaga',
      },
    });

    const profesional = await prisma.profesional.upsert({
      where: { usuarioId: usuario.idUsuario },
      update: {},
      create: {
        usuarioId: usuario.idUsuario,
        sectorId: sectorIds[p.sector],
        descripcion: p.descripcion,
        direccion: p.direccion,
      },
    });
    profesionalIds[p.email] = profesional.idProfesional;

    for (const s of p.servicios) {
      const servicio = await prisma.servicio.upsert({
        where: {
          profesionalId_nombre: { profesionalId: profesional.idProfesional, nombre: s.nombre },
        },
        update: {},
        create: {
          profesionalId: profesional.idProfesional,
          nombre: s.nombre,
          descripcion: s.descripcion,
          precio: s.precio,
          duracionMin: s.duracionMin,
        },
      });
      const clave = `${p.email}|${s.nombre}`;
      servicioIds[clave] = servicio.idServicio;
      servicioDuracion[clave] = s.duracionMin;
    }

    for (const diaSemana of DIAS) {
      for (const turno of TURNOS) {
        await prisma.horario.upsert({
          where: {
            profesionalId_diaSemana_horaInicio: {
              profesionalId: profesional.idProfesional,
              diaSemana,
              horaInicio: turno.horaInicio,
            },
          },
          update: {},
          create: {
            profesionalId: profesional.idProfesional,
            diaSemana,
            horaInicio: turno.horaInicio,
            horaFin: turno.horaFin,
          },
        });
      }
    }
  }

  // 4. Citas: se borran solo las de los clientes del seed y se vuelven a crear.
  await prisma.cita.deleteMany({
    where: { clienteId: { in: Object.values(clienteIds) } },
  });

  for (const c of CITAS) {
    const clave = `${c.profesional}|${c.servicio}`;
    const inicio = new Date(c.inicio);
    const fin = new Date(inicio.getTime() + servicioDuracion[clave]! * 60_000);

    await prisma.cita.create({
      data: {
        clienteId: clienteIds[c.cliente]!,
        profesionalId: profesionalIds[c.profesional]!,
        servicioId: servicioIds[clave]!,
        inicio,
        fin,
        estado: c.estado,
      },
    });
  }

  console.log(
    `Seed completado: ${SECTORES.length} sectores, ${CLIENTES.length} clientes, ` +
      `${PROFESIONALES.length} profesionales, ${CITAS.length} citas`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });