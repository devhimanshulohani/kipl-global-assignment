import express from 'express';
import { pinoHttp } from 'pino-http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import logger from './utils/logger';
import authRoutes from './modules/auth/auth.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import leavesRoutes from './modules/leaves/leaves.routes';
import usersRoutes from './modules/users/users.routes';
import leaveTypesRoutes from './modules/leave-types/leave-types.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

app.use(pinoHttp({ logger }));
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leave-types', leaveTypesRoutes);

app.use(errorHandler);

export default app;
