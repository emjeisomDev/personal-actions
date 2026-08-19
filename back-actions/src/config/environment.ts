import 'dotenv/config';

const port = Number(process.env['PORT'] ?? 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT must be a positive integer.');
}

const nodeEnv = process.env['NODE_ENV'] ?? 'development';

const databaseUrl = nodeEnv === 'test' ? process.env['DATABASE_URL_TEST'] : process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error(nodeEnv === 'test' ?
    'DATABASE_URL_TEST environment variable is required.' :
    'DATABASE_URL environment variable is required.'
  );
}

export const environment = {
  nodeEnv,
  port,
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:4200',
  databaseUrl
} as const;