-- CreateEnum
CREATE TYPE "EstadoCita" AS ENUM ('PROGRAMADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "Sector" (
    "idSector" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Sector_pkey" PRIMARY KEY ("idSector")
);

-- CreateTable
CREATE TABLE "Profesional" (
    "idProfesional" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "sectorId" INTEGER,
    "descripcion" TEXT,
    "direccion" TEXT,
    "valoracionMedia" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("idProfesional")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "idServicio" SERIAL NOT NULL,
    "profesionalId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(8,2) NOT NULL,
    "duracionMin" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("idServicio")
);

-- CreateTable
CREATE TABLE "Horario" (
    "idHorario" SERIAL NOT NULL,
    "profesionalId" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,

    CONSTRAINT "Horario_pkey" PRIMARY KEY ("idHorario")
);

-- CreateTable
CREATE TABLE "Cita" (
    "idCita" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "profesionalId" INTEGER NOT NULL,
    "servicioId" INTEGER NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fin" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoCita" NOT NULL DEFAULT 'PROGRAMADA',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cita_pkey" PRIMARY KEY ("idCita")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sector_nombre_key" ON "Sector"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Profesional_usuarioId_key" ON "Profesional"("usuarioId");

-- CreateIndex
CREATE INDEX "Profesional_sectorId_idx" ON "Profesional"("sectorId");

-- CreateIndex
CREATE INDEX "Servicio_precio_idx" ON "Servicio"("precio");

-- CreateIndex
CREATE UNIQUE INDEX "Servicio_profesionalId_nombre_key" ON "Servicio"("profesionalId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Horario_profesionalId_diaSemana_horaInicio_key" ON "Horario"("profesionalId", "diaSemana", "horaInicio");

-- CreateIndex
CREATE INDEX "Cita_profesionalId_inicio_idx" ON "Cita"("profesionalId", "inicio");

-- CreateIndex
CREATE INDEX "Cita_clienteId_inicio_idx" ON "Cita"("clienteId", "inicio");

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("idUsuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_sectorId_fkey" FOREIGN KEY ("sectorId") REFERENCES "Sector"("idSector") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("idProfesional") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Horario" ADD CONSTRAINT "Horario_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("idProfesional") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("idUsuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("idProfesional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cita" ADD CONSTRAINT "Cita_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("idServicio") ON DELETE RESTRICT ON UPDATE CASCADE;
