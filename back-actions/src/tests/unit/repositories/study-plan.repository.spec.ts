import { describe, expect, it } from 'vitest';
import { createDatabaseExecutorMock, createQueryResult } from './database-executor.mock.js';
import { StudyPlanRepository } from '../../../repositories/study-plan.repository.js';

describe('StudyPlanRepository', () => {
    describe('findAll', () => {
        it('Should return all plans and convert coefficient to number', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyPlanRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'plan-1',
                        name: 'Plano padrão',
                        coefficient: '1.50',
                        status: 'active'
                    },
                    {
                        id: 'plan-2',
                        name: 'Plano reduzido',
                        coefficient: '0.75',
                        status: 'inactive'
                    }
                ])
            );

            const result =
                await repository.findAll();

            expect(result).toEqual([
                {
                    id: 'plan-1',
                    name: 'Plano padrão',
                    coefficient: 1.5,
                    status: 'active'
                },
                {
                    id: 'plan-2',
                    name: 'Plano reduzido',
                    coefficient: 0.75,
                    status: 'inactive'
                }
            ]);

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'FROM study_plan'
                )
            );
        });
    });

    describe('findById', () => {
        it('Should return the found plan', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyPlanRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'plan-1',
                        name: 'Plano padrão',
                        coefficient: '1.25',
                        status: 'active'
                    }
                ])
            );

            await expect(
                repository.findById('plan-1')
            ).resolves.toEqual({
                id: 'plan-1',
                name: 'Plano padrão',
                coefficient: 1.25,
                status: 'active'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'WHERE id = $1'
                ),
                ['plan-1']
            );
        });

        it('Should return null when the plan does not exist', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyPlanRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.findById('missing-id')
            ).resolves.toBeNull();
        });
    });

    describe('findActive', () => {
        it('Should only query active plans', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyPlanRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'plan-1',
                        name: 'Plano ativo',
                        coefficient: '1.50',
                        status: 'active'
                    }
                ])
            );

            await expect(
                repository.findActive()
            ).resolves.toEqual([
                {
                    id: 'plan-1',
                    name: 'Plano ativo',
                    coefficient: 1.5,
                    status: 'active'
                }
            ]);

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    "status = 'active'"
                )
            );
        });
    });

    describe('create', () => {
        it('Must create a plan', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyPlanRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'plan-1',
                        name: 'Plano padrão',
                        coefficient: '1.50',
                        status: 'active'
                    }
                ])
            );

            const result =
                await repository.create({
                    name: 'Plano padrão',
                    coefficient: 1.5,
                    status: 'active'
                });

            expect(result).toEqual({
                id: 'plan-1',
                name: 'Plano padrão',
                coefficient: 1.5,
                status: 'active'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'INSERT INTO study_plan'
                ),
                [
                    'Plano padrão',
                    1.5,
                    'active'
                ]
            );
        });
    });
});