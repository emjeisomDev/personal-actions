import { describe, expect, it } from 'vitest';

import {
    WeeklyAssessmentRepository
} from '../../../repositories/weekly-assessment.repository.js';

import {
    createDatabaseExecutorMock,
    createQueryResult
} from './database-executor.mock.js';

describe(
    'WeeklyAssessmentRepository',
    () => {
        const assessmentRow = {
            id:
                'assessment-1',
            study_area_week_id:
                'week-1',
            week_goal:
                1500,
            minutes_studied:
                900,
            goal_achieved:
                false
        };

        const assessment = {
            id:
                'assessment-1',
            studyAreaWeekId:
                'week-1',
            weekGoal:
                1500,
            minutesStudied:
                900,
            goalAchieved:
                false
        };

        describe(
            'findById',
            () => {
                it(
                    'deve retornar a avaliação mapeada',
                    async () => {
                        const {
                            database,
                            query
                        } =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                database
                            );

                        query.mockResolvedValue(
                            createQueryResult([
                                assessmentRow
                            ])
                        );

                        await expect(
                            repository.findById(
                                'assessment-1'
                            )
                        ).resolves.toEqual(
                            assessment
                        );

                        expect(query)
                            .toHaveBeenCalledWith(
                                expect.stringContaining(
                                    'WHERE id = $1'
                                ),
                                [
                                    'assessment-1'
                                ]
                            );
                    }
                );

                it(
                    'deve retornar null quando a avaliação não existir',
                    async () => {
                        const {
                            database,
                            query
                        } =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                database
                            );

                        query.mockResolvedValue(
                            createQueryResult([])
                        );

                        await expect(
                            repository.findById(
                                'missing-id'
                            )
                        ).resolves.toBeNull();
                    }
                );
            }
        );

        describe(
            'findByStudyAreaWeekId',
            () => {
                it(
                    'deve retornar a avaliação da semana',
                    async () => {
                        const {
                            database,
                            query
                        } =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                database
                            );

                        query.mockResolvedValue(
                            createQueryResult([
                                assessmentRow
                            ])
                        );

                        await expect(
                            repository
                                .findByStudyAreaWeekId(
                                    'week-1'
                                )
                        ).resolves.toEqual(
                            assessment
                        );

                        expect(query)
                            .toHaveBeenCalledWith(
                                expect.stringContaining(
                                    'study_area_week_id = $1'
                                ),
                                [
                                    'week-1'
                                ]
                            );
                    }
                );

                it(
                    'deve retornar null quando não houver avaliação',
                    async () => {
                        const {
                            database,
                            query
                        } =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                database
                            );

                        query.mockResolvedValue(
                            createQueryResult([])
                        );

                        await expect(
                            repository
                                .findByStudyAreaWeekId(
                                    'week-1'
                                )
                        ).resolves.toBeNull();
                    }
                );
            }
        );

        describe(
            'create',
            () => {
                it(
                    'deve criar uma avaliação semanal',
                    async () => {
                        const {
                            database,
                            query
                        } =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                database
                            );

                        query.mockResolvedValue(
                            createQueryResult([
                                assessmentRow
                            ])
                        );

                        const result =
                            await repository.create({
                                studyAreaWeekId:
                                    'week-1',
                                weekGoal:
                                    1500,
                                minutesStudied:
                                    900,
                                goalAchieved:
                                    false
                            });

                        expect(result)
                            .toEqual(
                                assessment
                            );

                        expect(query)
                            .toHaveBeenCalledWith(
                                expect.stringContaining(
                                    'INSERT INTO weekly_assessment'
                                ),
                                [
                                    'week-1',
                                    1500,
                                    900,
                                    false
                                ]
                            );
                    }
                );
            }
        );

        describe(
            'update',
            () => {
                it(
                    'deve atualizar uma avaliação existente',
                    async () => {
                        const {
                            database,
                            query
                        } =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                database
                            );

                        const updatedRow = {
                            ...assessmentRow,
                            minutes_studied:
                                1500,
                            goal_achieved:
                                true
                        };

                        query.mockResolvedValue(
                            createQueryResult([
                                updatedRow
                            ])
                        );

                        const result =
                            await repository.update(
                                'assessment-1',
                                {
                                    studyAreaWeekId:
                                        'week-1',
                                    weekGoal:
                                        1500,
                                    minutesStudied:
                                        1500,
                                    goalAchieved:
                                        true
                                }
                            );

                        expect(result)
                            .toEqual({
                                ...assessment,
                                minutesStudied:
                                    1500,
                                goalAchieved:
                                    true
                            });

                        expect(query)
                            .toHaveBeenCalledWith(
                                expect.stringContaining(
                                    'UPDATE weekly_assessment'
                                ),
                                [
                                    'week-1',
                                    1500,
                                    1500,
                                    true,
                                    'assessment-1'
                                ]
                            );
                    }
                );

                it(
                    'deve retornar null quando a avaliação não existir',
                    async () => {
                        const {
                            database,
                            query
                        } =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                database
                            );

                        query.mockResolvedValue(
                            createQueryResult([])
                        );

                        await expect(
                            repository.update(
                                'missing-id',
                                {
                                    studyAreaWeekId:
                                        'week-1',
                                    weekGoal:
                                        1500,
                                    minutesStudied:
                                        0,
                                    goalAchieved:
                                        false
                                }
                            )
                        ).resolves.toBeNull();
                    }
                );
            }
        );

        describe(
            'forExecutor',
            () => {
                it(
                    'deve executar a mesma instância sobre outro executor',
                    async () => {
                        const original =
                            createDatabaseExecutorMock();

                        const transaction =
                            createDatabaseExecutorMock();

                        const repository =
                            new WeeklyAssessmentRepository(
                                original.database
                            );

                        transaction.query
                            .mockResolvedValue(
                                createQueryResult([
                                    assessmentRow
                                ])
                            );

                        const transactionalRepository =
                            repository.forExecutor(
                                transaction.database
                            );

                        await expect(
                            transactionalRepository
                                .findByStudyAreaWeekId(
                                    'week-1'
                                )
                        ).resolves.toEqual(
                            assessment
                        );

                        expect(
                            transaction.query
                        ).toHaveBeenCalledWith(
                            expect.stringContaining(
                                'study_area_week_id = $1'
                            ),
                            [
                                'week-1'
                            ]
                        );

                        expect(
                            original.query
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );
    }
);