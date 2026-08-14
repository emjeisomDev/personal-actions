import 'dotenv/config';

const port = Number(process.env['PORT'] ?? 3000);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error('PORT must be a positive integer.');
}

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required.');
}

export const environment = {
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port,
  corsOrigin: process.env['CORS_ORIGIN'] ?? 'http://localhost:4200',
  databaseUrl
} as const;