import express from 'express';
import { getHealthStatus, getWelcomeMessage } from './controllers/system.controller.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';

const app = express();

app.use(express.json());

app.get('/', getWelcomeMessage);
app.get('/health', getHealthStatus);
app.all('/{*any}', notFoundHandler);

export default app;