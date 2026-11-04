## Base de datos (Supabase + Prisma)

La base de datos es PostgreSQL en Supabase y se maneja con Prisma. Es **compartida** por todo el equipo: si un compañero ya creó las tablas, tú no tienes que repetirlo.

### Requisitos

- Node.js y npm.
- Acceso al proyecto `chapuzapp` en Supabase.

### Configuración

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea tu archivo `.env` a partir de la plantilla:

   ```bash
   cp .env.example .env
   ```

3. En Supabase pulsa el botón **Connect** y copia dos cadenas de conexión:
   - **Transaction pooler** (puerto 6543) → `DATABASE_URL`. La usa la aplicación.
   - **Session pooler** (puerto 5432) → `DIRECT_URL`. La usa Prisma para crear tablas.

   Sustituye `[YOUR-PASSWORD]` por la contraseña de la base de datos, sin los corchetes.

4. Pon en `JWT_SECRET` un secreto propio. Puedes generar uno con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

> El archivo `.env` contiene contraseñas. No se sube a GitHub y no se comparte.

### Crear las tablas

Aplica las migraciones que ya existen en `prisma/migrations`:

```bash
npx prisma migrate deploy
```

Si cambias `prisma/schema.prisma`, crea una migración nueva con:

```bash
npx prisma migrate dev --name nombre_del_cambio
```

### Datos de prueba (seed)

```bash
npm run seed
```

Crea dos usuarios. Se puede ejecutar varias veces sin duplicarlos.

| Email | Rol | Contraseña |
| --- | --- | --- |
| `cliente@chapuzapp.test` | CLIENTE | `Chapuzapp123` |
| `profesional@chapuzapp.test` | PROFESIONAL | `Chapuzapp123` |

Estas contraseñas son solo para desarrollo.

### Ver los datos

- En Supabase, en **Table Editor**.
- O en local con `npx prisma studio`.

### Tabla `Usuario`

| Campo | Descripción |
| --- | --- |
| `idUsuario` | Identificador. Se genera solo. |
| `nombre` | Nombre del usuario. |
| `email` | Correo. No puede repetirse. |
| `passwordHash` | Contraseña cifrada con bcrypt. |
| `rol` | `CLIENTE` o `PROFESIONAL`. |
| `creadoEn` | Fecha de creación. |
| `actualizadoEn` | Fecha de la última modificación. |