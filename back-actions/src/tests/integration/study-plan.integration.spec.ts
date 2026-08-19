import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { PoolClient } from 'pg';
import { StudyPlanRepository } from '../../repositories/study-plan.repository.js';
import { StudyPlanService } from '../../services/study-plan.service.js';
import { cleanIntegrationDatabase, integrationDatabasePool } from './helpers/integration-test-database.js';

let databaseClient: PoolClient;

function createStudyPlanService(): StudyPlanService {
    const repository =
        new StudyPlanRepository(databaseClient);

    return new StudyPlanService(repository);
}

describe(
    'StudyPlan integration',
    () => {
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

        it(
            'deve criar um StudyPlan e persistir os dados no PostgreSQL',
            async () => {
                const service =
                    createStudyPlanService();

                const result =
                    await service.create({
                        name: 'Plano padrão',
                        coefficient: 1.5,
                        status: 'active'
                    });

                expect(result.id)
                    .toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                    );

                expect(result.name)
                    .toBe('Plano padrão');

                expect(result.coefficient)
                    .toBe(1.5);

                expect(result.status)
                    .toBe('active');

                const databaseResult =
                    await databaseClient.query<{
                        id: string;
                        name: string;
                        coefficient: string;
                        status: string;
                    }>(
                        `
                        SELECT
                            id,
                            name,
                            coefficient,
                            status
                        FROM study_plan
                        WHERE id = $1
                        `,
                        [result.id]
                    );

                expect(databaseResult.rows)
                    .toHaveLength(1);

                expect(databaseResult.rows[0])
                    .toEqual({
                        id: result.id,
                        name: 'Plano padrão',
                        coefficient: '1.50',
                        status: 'active'
                    });
            }
        );

        it(
            'deve buscar um StudyPlan persistido pelo id',
            async () => {
                const service =
                    createStudyPlanService();

                const created =
                    await service.create({
                        name: 'Plano principal',
                        coefficient: 1.25,
                        status: 'active'
                    });

                const result =
                    await service.findById(
                        created.id
                    );

                expect(result)
                    .toEqual({
                        id: created.id,
                        name: 'Plano principal',
                        coefficient: 1.25,
                        status: 'active'
                    });
            }
        );

        it(
            'deve retornar todos os StudyPlans persistidos em ordem de nome',
            async () => {
                const service =
                    createStudyPlanService();

                const standard =
                    await service.create({
                        name: 'Plano padrão',
                        coefficient: 1.5,
                        status: 'active'
                    });

                const reduced =
                    await service.create({
                        name: 'Plano reduzido',
                        coefficient: 0.75,
                        status: 'inactive'
                    });

                const result =
                    await service.findAll();

                expect(result)
                    .toEqual([
                        standard,
                        reduced
                    ]);
            }
        );

        it(
            'deve retornar somente StudyPlans ativos',
            async () => {
                const service =
                    createStudyPlanService();

                const activePlan =
                    await service.create({
                        name: 'Plano ativo',
                        coefficient: 1.5,
                        status: 'active'
                    });

                await service.create({
                    name: 'Plano inativo',
                    coefficient: 0.75,
                    status: 'inactive'
                });

                const result =
                    await service.findActive();

                expect(result)
                    .toEqual([
                        activePlan
                    ]);
            }
        );

        it(
            'deve permitir selecionar um StudyPlan ativo',
            async () => {
                const service =
                    createStudyPlanService();

                const created =
                    await service.create({
                        name: 'Plano ativo',
                        coefficient: 1.5,
                        status: 'active'
                    });

                const result =
                    await service.findSelectableById(
                        created.id
                    );

                expect(result)
                    .toEqual(created);
            }
        );

        it(
            'deve rejeitar a seleção de um StudyPlan inativo',
            async () => {
                const service =
                    createStudyPlanService();

                const created =
                    await service.create({
                        name: 'Plano inativo',
                        coefficient: 1.5,
                        status: 'inactive'
                    });

                await expect(
                    service.findSelectableById(
                        created.id
                    )
                ).rejects.toThrowError(
                    'Inactive study plans cannot be selected for a new week.'
                );
            }
        );

        it(
            'deve rejeitar coefficient igual a zero antes da persistência',
            async () => {
                const service =
                    createStudyPlanService();

                await expect(
                    service.create({
                        name: 'Plano inválido',
                        coefficient: 0,
                        status: 'active'
                    })
                ).rejects.toThrowError(
                    'Coefficient must be greater than zero.'
                );

                const databaseResult =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM study_plan
                        `
                    );

                expect(
                    databaseResult.rows[0]?.count
                ).toBe('0');
            }
        );

        it(
            'deve rejeitar coefficient negativo antes da persistência',
            async () => {
                const service =
                    createStudyPlanService();

                await expect(
                    service.create({
                        name: 'Plano inválido',
                        coefficient: -1,
                        status: 'active'
                    })
                ).rejects.toThrowError(
                    'Coefficient must be greater than zero.'
                );

                const databaseResult =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM study_plan
                        `
                    );

                expect(
                    databaseResult.rows[0]?.count
                ).toBe('0');
            }
        );

        it(
            'deve rejeitar coefficient igual a zero diretamente no PostgreSQL',
            async () => {
                await expect(
                    databaseClient.query(
                        `
                        INSERT INTO study_plan (
                            name,
                            coefficient,
                            status
                        )
                        VALUES (
                            'Invalid Integration Plan',
                            0,
                            'active'
                        )
                        `
                    )
                ).rejects.toThrow();

                const databaseResult =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM study_plan
                        `
                    );

                expect(
                    databaseResult.rows[0]?.count
                ).toBe('0');
            }
        );

        it(
            'deve rejeitar status inválido diretamente no PostgreSQL',
            async () => {
                await expect(
                    databaseClient.query(
                        `
                        INSERT INTO study_plan (
                            name,
                            coefficient,
                            status
                        )
                        VALUES (
                            'Invalid Status Plan',
                            1.5,
                            'archived'
                        )
                        `
                    )
                ).rejects.toThrow();

                const databaseResult =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM study_plan
                        `
                    );

                expect(
                    databaseResult.rows[0]?.count
                ).toBe('0');
            }
        );
    }
);