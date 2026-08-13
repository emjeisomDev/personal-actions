import express from 'express';
import cors from 'cors';

import { environment } from './config/environment.js';

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
  (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'back-actions',
      environment:
        environment.nodeEnv
    });
  }
);