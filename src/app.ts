import express from 'express';
import { getHealthStatus, getWelcomeMessage } from './controllers/system.controller.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import authRouter from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error-handler.middleware.js';

const app = express();

app.use(express.json());

app.get('/', getWelcomeMessage);
app.get('/health', getHealthStatus);

app.use('/auth', authRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
