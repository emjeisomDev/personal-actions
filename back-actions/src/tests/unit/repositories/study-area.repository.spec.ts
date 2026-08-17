import { describe, expect, it } from 'vitest';
import { createDatabaseExecutorMock, createQueryResult } from './database-executor.mock.js';
import { StudyAreaRepository } from '../../../repositories/study-area.repository.js';

describe('StudyAreaRepository', () => {
    describe('findAll', () => {
        it('deve retornar todas as áreas mapeadas', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            const rows = [
                {
                    id: 'area-1',
                    name: 'Angular',
                    weekly_goal_minutes: 1500
                },
                {
                    id: 'area-2',
                    name: 'TypeScript',
                    weekly_goal_minutes: 900
                }
            ];

            query.mockResolvedValue(
                createQueryResult(rows)
            );

            const result =
                await repository.findAll();

            expect(result).toEqual([
                {
                    id: 'area-1',
                    name: 'Angular',
                    weeklyGoalMinutes: 1500
                },
                {
                    id: 'area-2',
                    name: 'TypeScript',
                    weeklyGoalMinutes: 900
                }
            ]);

            expect(query).toHaveBeenCalledTimes(1);
            expect(query.mock.calls[0][1]).toBeUndefined();
        });
    });

    describe('findById', () => {
        it('deve retornar a área quando encontrada', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'area-1',
                        name: 'Angular',
                        weekly_goal_minutes: 1500
                    }
                ])
            );

            const result =
                await repository.findById('area-1');

            expect(result).toEqual({
                id: 'area-1',
                name: 'Angular',
                weeklyGoalMinutes: 1500
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'WHERE id = $1'
                ),
                ['area-1']
            );
        });

        it('deve retornar null quando a área não existir', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.findById('missing-id')
            ).resolves.toBeNull();
        });
    });

    describe('create', () => {
        it('deve inserir a área e mapear o resultado', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'area-1',
                        name: 'Angular',
                        weekly_goal_minutes: 1500
                    }
                ])
            );

            const result =
                await repository.create({
                    name: 'Angular',
                    weeklyGoalMinutes: 1500
                });

            expect(result).toEqual({
                id: 'area-1',
                name: 'Angular',
                weeklyGoalMinutes: 1500
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'INSERT INTO study_area'
                ),
                [
                    'Angular',
                    1500
                ]
            );
        });
    });

    describe('update', () => {
        it('deve atualizar a área existente', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'area-1',
                        name: 'Angular Avançado',
                        weekly_goal_minutes: 1800
                    }
                ])
            );

            const result =
                await repository.update(
                    'area-1',
                    {
                        name: 'Angular Avançado',
                        weeklyGoalMinutes: 1800
                    }
                );

            expect(result).toEqual({
                id: 'area-1',
                name: 'Angular Avançado',
                weeklyGoalMinutes: 1800
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'UPDATE study_area'
                ),
                [
                    'Angular Avançado',
                    1800,
                    'area-1'
                ]
            );
        });

        it('deve retornar null quando a área não existir', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.update(
                    'missing-id',
                    {
                        name: 'Angular',
                        weeklyGoalMinutes: 1500
                    }
                )
            ).resolves.toBeNull();
        });
    });

    describe('delete', () => {
        it('deve retornar true quando uma área for excluída', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            query.mockResolvedValue(
                createQueryResult(
                    [],
                    1
                )
            );

            await expect(
                repository.delete('area-1')
            ).resolves.toBe(true);

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'DELETE FROM study_area'
                ),
                ['area-1']
            );
        });

        it('deve retornar false quando nenhuma área for excluída', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaRepository(database);

            query.mockResolvedValue(
                createQueryResult(
                    [],
                    0
                )
            );

            await expect(
                repository.delete('missing-id')
            ).resolves.toBe(false);
        });
    });
});