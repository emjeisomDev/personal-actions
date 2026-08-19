import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
    closeIntegrationDatabase,
    integrationDatabasePool,
    migrateIntegrationDatabase
} from './integration-test-database.js';

describe(
    'Integration PostgreSQL infrastructure',
    () => {
        beforeAll(
            async () => {
                await migrateIntegrationDatabase();
            }
        );

        afterAll(
            async () => {
                await closeIntegrationDatabase();
            }
        );

        it('deve conectar ao PostgreSQL de integração',
            async () => {
                const result =
                    await integrationDatabasePool.query<{
                        connected: number;
                    }>('SELECT 1 AS connected');

                expect(result.rows[0]?.connected).toBe(1);
            }
        );

        it('deve possuir todas as tabelas do domínio',
            async () => {
                const result =
                    await integrationDatabasePool.query<{
                        table_name: string;
                    }>(
                        `
                        SELECT table_name
                        FROM information_schema.tables
                        WHERE table_schema = 'public'
                            AND table_name IN (
                            'study_area',
                            'study_plan',
                            'study_area_week',
                            'study_record',
                            'weekly_assessment'
                            )
                        ORDER BY table_name
                        `
                    );

                expect(result.rows.map(row => row.table_name)
                ).toEqual([
                    'study_area',
                    'study_area_week',
                    'study_plan',
                    'study_record',
                    'weekly_assessment'
                ]);
            }
        );

        it('deve possuir a constraint de coefficient positivo',
            async () => {
                const result =
                    await integrationDatabasePool.query<{
                        constraint_name: string;
                    }>(
                        `
                        SELECT constraint_name
                        FROM information_schema.table_constraints
                        WHERE table_schema = 'public'
                            AND table_name = 'study_plan'
                            AND constraint_name =
                            'study_plan_coefficient_positive_check'
                        `
                    );
                expect(result.rows).toHaveLength(1);
            }
        );

        it('deve rejeitar coefficient menor ou igual a zero',
            async () => {
                await expect(
                    integrationDatabasePool.query(
                        `
                        INSERT INTO study_plan
                            (name, coefficient, status)
                        VALUES
                            ('Integration invalid', 0, 'active')
                        `
                    )).rejects.toThrow();
            }
        );
    }
);