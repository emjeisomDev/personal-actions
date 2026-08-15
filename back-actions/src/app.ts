import express from 'express';
import cors from 'cors';

import { environment } from './config/environment.js';
import { checkDatabaseConnection } from './config/database.js';

export const app = express();

app.use(
  cors({
    origin: environment.corsOrigin
  })
);

app.use(
  express.json()
);

app.get(
  '/health',
  async (_request, response) => {
    try {
      await checkDatabaseConnection();

      response.status(200).json({
        status: 'ok',
        service: 'back-actions',
        environment:
          environment.nodeEnv,
        database: 'connected'
      });
    } catch (error) {
      console.error(
        'Health check failed.',
        error
      );

      response.status(503).json({
        status: 'error',
        service: 'back-actions',
        environment:
          environment.nodeEnv,
        database: 'unavailable'
      });
    }
  }
);