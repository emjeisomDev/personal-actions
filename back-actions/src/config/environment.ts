import 'dotenv/config';

const nodeEnv = process.env['NODE_ENV'] ?? 'development';

const supportedNodeEnvironments = ['development', 'test', 'production'] as const;

type NodeEnvironment = (typeof supportedNodeEnvironments)[number];

function isNodeEnvironment(value: string): value is NodeEnvironment {
  return supportedNodeEnvironments.includes(value as NodeEnvironment);
}

if (!isNodeEnvironment(nodeEnv)) {
  throw new Error(`NODE_ENV must be one of: ${supportedNodeEnvironments.join(', ')}.`);
}

const port = Number(process.env['PORT'] ?? 3000);

if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

const databaseUrl =
  nodeEnv === 'test'
    ? process.env['DATABASE_URL_TEST']
    : process.env['DATABASE_URL'];

if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
  throw new Error(
    nodeEnv === 'test'
      ? 'DATABASE_URL_TEST environment variable is required when NODE_ENV=test.'
      : 'DATABASE_URL environment variable is required.'
  );
}

const corsOrigin = process.env['CORS_ORIGIN']?.trim();

if (nodeEnv === 'production' && (!corsOrigin || corsOrigin.length === 0)) {
  throw new Error('CORS_ORIGIN environment variable is required when NODE_ENV=production.');
}

export const environment = {
  nodeEnv,
  port,
  corsOrigin:
    corsOrigin && corsOrigin.length > 0
      ? corsOrigin
      : 'http://localhost:4200',
  databaseUrl: databaseUrl.trim()
} as const;