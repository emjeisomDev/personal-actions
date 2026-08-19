import dotenv from 'dotenv';
import { Pool } from 'pg';
import { runner } from 'node-pg-migrate';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({
    path: '.env.test'
});

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const projectRoot = path.resolve(currentDirectory, '../../../..');
const migrationsDirectory = path.join(projectRoot, 'migrations');
const migrationTable = 'pgmigrations_integration';

const integrationTables = [
    'weekly_assessment',
    'study_record',
    'study_area_week',
    'study_plan',
    'study_area'
] as const;

function getDatabaseUrl(): string {
    const databaseUrl = process.env['DATABASE_URL_TEST'];

    if (typeof databaseUrl !== 'string' || databaseUrl.trim().length === 0) {
        throw new Error('DATABASE_URL_TEST environment variable is required to run integration tests.');
    }

    if (!databaseUrl.includes('personal_actions_db_test')) {
        throw new Error('Integration tests must use personal_actions_db_test.');
    }

    return databaseUrl;
}

const databaseUrl = getDatabaseUrl();

export const integrationDatabasePool =
    new Pool({
        connectionString: databaseUrl,
        max: 5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000
    });

let migrationsCompleted = false;
let migrationPromise: Promise<void> | undefined;

export async function migrateIntegrationDatabase(): Promise<void> {
    if (migrationsCompleted) {
        return;
    }

    if (migrationPromise) {
        return migrationPromise;
    }

    migrationPromise = runner({
        databaseUrl,
        dir: migrationsDirectory,
        direction: 'up',
        migrationsTable: migrationTable,
        count: Infinity
    })
        .then(() => {
            migrationsCompleted = true;
        })
        .finally(() => {
            migrationPromise = undefined;
        });

    return migrationPromise;
}

export async function cleanIntegrationDatabase(): Promise<void> {
    const client = await integrationDatabasePool.connect();
    const tables = integrationTables.join(', ');

    try {
        await client.query('BEGIN');
        await client.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

export async function closeIntegrationDatabase(): Promise<void> {
    await integrationDatabasePool.end();
    migrationsCompleted = false;
    migrationPromise = undefined;
}