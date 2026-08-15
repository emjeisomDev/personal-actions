import { Pool, type PoolConfig } from 'pg';
import { environment } from './environment.js';

const poolConfig: PoolConfig = {
    connectionString: environment.databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000
};

export const databasePool = new Pool(poolConfig);

export async function checkDatabaseConnection(): Promise<void> {
    const client = await databasePool.connect();

    try {
        await client.query('SELECT 1');
    }
    finally {
        client.release();
    }
}

export async function closeDatabaseConnection(): Promise<void> {
    await databasePool.end();
}