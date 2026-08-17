import { describe, expect, it } from 'vitest';
import { StudyAreaWeekRepository } from '../../../repositories/study-area-week.repository.js';
import { createDatabaseExecutorMock, createQueryResult } from './database-executor.mock.js';

describe('StudyAreaWeekRepository', () => {
    describe('findById', () => {
        it('deve retornar a configuração encontrada', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaWeekRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'week-1',
                        week_start_date: '2026-08-17',
                        study_area_id: 'area-1',
                        study_plan_id: 'plan-1'
                    }
                ])
            );

            await expect(
                repository.findById('week-1')
            ).resolves.toEqual({
                id: 'week-1',
                weekStartDate: '2026-08-17',
                studyAreaId: 'area-1',
                studyPlanId: 'plan-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'WHERE id = $1'
                ),
                ['week-1']
            );
        });

        it('deve retornar null quando não encontrar configuração', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaWeekRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.findById('missing-id')
            ).resolves.toBeNull();
        });
    });

    describe('findByAreaAndWeek', () => {
        it('deve consultar por área e semana', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaWeekRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'week-1',
                        week_start_date: '2026-08-17',
                        study_area_id: 'area-1',
                        study_plan_id: 'plan-1'
                    }
                ])
            );

            await expect(
                repository.findByAreaAndWeek(
                    'area-1',
                    '2026-08-17'
                )
            ).resolves.toEqual({
                id: 'week-1',
                weekStartDate: '2026-08-17',
                studyAreaId: 'area-1',
                studyPlanId: 'plan-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'study_area_id = $1'
                ),
                [
                    'area-1',
                    '2026-08-17'
                ]
            );
        });

        it('deve retornar null quando não houver configuração', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaWeekRepository(database);

            query.mockResolvedValue(
                createQueryResult([])
            );

            await expect(
                repository.findByAreaAndWeek(
                    'area-1',
                    '2026-08-17'
                )
            ).resolves.toBeNull();
        });
    });

    describe('findByWeekStartDate', () => {
        it('deve retornar todas as configurações da semana', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaWeekRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'week-1',
                        week_start_date: '2026-08-17',
                        study_area_id: 'area-1',
                        study_plan_id: 'plan-1'
                    },
                    {
                        id: 'week-2',
                        week_start_date: '2026-08-17',
                        study_area_id: 'area-2',
                        study_plan_id: 'plan-1'
                    }
                ])
            );

            await expect(
                repository.findByWeekStartDate(
                    '2026-08-17'
                )
            ).resolves.toEqual([
                {
                    id: 'week-1',
                    weekStartDate: '2026-08-17',
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1'
                },
                {
                    id: 'week-2',
                    weekStartDate: '2026-08-17',
                    studyAreaId: 'area-2',
                    studyPlanId: 'plan-1'
                }
            ]);

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'WHERE week_start_date = $1'
                ),
                ['2026-08-17']
            );
        });
    });

    describe('create', () => {
        it('deve criar uma configuração semanal', async () => {
            const {
                database,
                query
            } = createDatabaseExecutorMock();

            const repository =
                new StudyAreaWeekRepository(database);

            query.mockResolvedValue(
                createQueryResult([
                    {
                        id: 'week-1',
                        week_start_date: '2026-08-17',
                        study_area_id: 'area-1',
                        study_plan_id: 'plan-1'
                    }
                ])
            );

            const result =
                await repository.create({
                    weekStartDate: '2026-08-17',
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1'
                });

            expect(result).toEqual({
                id: 'week-1',
                weekStartDate: '2026-08-17',
                studyAreaId: 'area-1',
                studyPlanId: 'plan-1'
            });

            expect(query).toHaveBeenCalledWith(
                expect.stringContaining(
                    'INSERT INTO study_area_week'
                ),
                [
                    '2026-08-17',
                    'area-1',
                    'plan-1'
                ]
            );
        });
    });
});