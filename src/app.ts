import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import citasRoutes from './modules/citas/citas.routes.js';
import profesionalesRoutes from './modules/profesionales/profesionales.routes.js';
import sectoresRoutes from './modules/sectores/sectores.routes.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/sectores', sectoresRoutes);

app.use(errorHandler);

export default app;

