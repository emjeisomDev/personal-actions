import dotenv from 'dotenv';

dotenv.config({
  path: '.env.test'
});

process.env['NODE_ENV'] = 'test';

if (typeof process.env['DATABASE_URL_TEST'] !== 'string' || process.env['DATABASE_URL_TEST'].trim().length === 0) {
  throw new Error('DATABASE_URL_TEST environment variable is required to run integration tests.');
}

export async function setup(): Promise<() => Promise<void>> {
  const {
    migrateIntegrationDatabase,
    closeIntegrationDatabase
  } = await import(
    './helpers/integration-test-database.js'
  );

  await migrateIntegrationDatabase();

  return async (): Promise<void> => {
    await closeIntegrationDatabase();
  };
}