import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PoolClient } from 'pg';
import { StudyAreaRepository } from '../../repositories/study-area.repository.js';
import { StudyAreaService } from '../../services/study-area.service.js';

import {
    cleanIntegrationDatabase,
    closeIntegrationDatabase,
    integrationDatabasePool,
    migrateIntegrationDatabase
} from './helpers/integration-test-database.js';

let databaseClient: PoolClient;

function createStudyAreaService(): StudyAreaService {
    const repository = new StudyAreaRepository(databaseClient);

    return new StudyAreaService(repository);
}

describe(
    'StudyArea integration',
    () => {
        beforeAll(
            async () => {
                await migrateIntegrationDatabase();
            }
        );

        beforeEach(
            async () => {
                await cleanIntegrationDatabase();

                databaseClient =
                    await integrationDatabasePool.connect();
            }
        );

        afterEach(
            async () => {
                databaseClient.release();
            }
        );

        afterAll(
            async () => {
                await closeIntegrationDatabase();
            }
        );

        it(
            'deve criar uma StudyArea e persistir os dados no PostgreSQL',
            async () => {
                const service =
                    createStudyAreaService();

                const result =
                    await service.create({
                        name: '  Angular  ',
                        weeklyGoalMinutes: 600
                    });

                expect(result.id)
                    .toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                    );

                expect(result.name)
                    .toBe('Angular');

                expect(result.weeklyGoalMinutes)
                    .toBe(600);

                const databaseResult =
                    await integrationDatabasePool.query<{
                        id: string;
                        name: string;
                        weekly_goal_minutes: number;
                    }>(
                        `
                        SELECT
                            id,
                            name,
                            weekly_goal_minutes
                        FROM study_area
                        WHERE id = $1
                        `,
                        [result.id]
                    );

                expect(databaseResult.rows)
                    .toHaveLength(1);

                expect(databaseResult.rows[0])
                    .toEqual({
                        id: result.id,
                        name: 'Angular',
                        weekly_goal_minutes: 600
                    });
            }
        );

        it(
            'deve buscar uma StudyArea persistida pelo id',
            async () => {
                const service =
                    createStudyAreaService();

                const created =
                    await service.create({
                        name: 'TypeScript',
                        weeklyGoalMinutes: 900
                    });

                const result =
                    await service.findById(
                        created.id
                    );

                expect(result)
                    .toEqual({
                        id: created.id,
                        name: 'TypeScript',
                        weeklyGoalMinutes: 900
                    });
            }
        );

        it(
            'deve retornar todas as StudyAreas persistidas em ordem de nome',
            async () => {
                const service =
                    createStudyAreaService();

                const angular =
                    await service.create({
                        name: 'Angular',
                        weeklyGoalMinutes: 600
                    });

                const typescript =
                    await service.create({
                        name: 'TypeScript',
                        weeklyGoalMinutes: 900
                    });

                const result =
                    await service.findAll();

                expect(result)
                    .toEqual([
                        angular,
                        typescript
                    ]);
            }
        );

        it(
            'deve atualizar uma StudyArea persistida',
            async () => {
                const service =
                    createStudyAreaService();

                const created =
                    await service.create({
                        name: 'Angular',
                        weeklyGoalMinutes: 600
                    });

                const updated =
                    await service.update(
                        created.id,
                        {
                            name: 'Angular Avançado',
                            weeklyGoalMinutes: 900
                        }
                    );

                expect(updated)
                    .toEqual({
                        id: created.id,
                        name: 'Angular Avançado',
                        weeklyGoalMinutes: 900
                    });

                const databaseResult =
                    await integrationDatabasePool.query<{
                        name: string;
                        weekly_goal_minutes: number;
                    }>(
                        `
                        SELECT
                            name,
                            weekly_goal_minutes
                        FROM study_area
                        WHERE id = $1
                        `,
                        [created.id]
                    );

                expect(databaseResult.rows)
                    .toEqual([
                        {
                            name: 'Angular Avançado',
                            weekly_goal_minutes: 900
                        }
                    ]);
            }
        );

        it(
            'deve excluir uma StudyArea persistida',
            async () => {
                const service =
                    createStudyAreaService();

                const created =
                    await service.create({
                        name: 'Angular',
                        weeklyGoalMinutes: 600
                    });

                await service.delete(
                    created.id
                );

                const databaseResult =
                    await integrationDatabasePool.query(
                        `
                        SELECT id
                        FROM study_area
                        WHERE id = $1
                        `,
                        [created.id]
                    );

                expect(databaseResult.rows)
                    .toHaveLength(0);
            }
        );

        it(
            'deve rejeitar weeklyGoalMinutes inválido antes da persistência',
            async () => {
                const service =
                    createStudyAreaService();

                await expect(
                    service.create({
                        name: 'Angular',
                        weeklyGoalMinutes: 0
                    })
                ).rejects.toThrowError(
                    'weeklyGoalMinutes must be a positive integer.'
                );

                const databaseResult =
                    await integrationDatabasePool.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM study_area
                        `
                    );

                expect(databaseResult.rows[0]?.count)
                    .toBe('0');
            }
        );

        it(
            'deve rejeitar diretamente no PostgreSQL weekly_goal_minutes igual a zero',
            async () => {
                await expect(
                    integrationDatabasePool.query(
                        `
                        INSERT INTO study_area (
                            name,
                            weekly_goal_minutes
                        )
                        VALUES (
                            'Invalid Integration Area',
                            0
                        )
                        `
                    )
                ).rejects.toThrow();

                const databaseResult =
                    await integrationDatabasePool.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM study_area
                        `
                    );

                expect(databaseResult.rows[0]?.count)
                    .toBe('0');
            }
        );
    }
);