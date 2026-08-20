import { beforeEach, describe, expect, it } from 'vitest';
import { StudyAreaWeekRepository } from '../../repositories/study-area-week.repository.js';
import { WeeklyAssessmentRepository } from '../../repositories/weekly-assessment.repository.js';
import { WeeklyAssessmentService } from '../../services/weekly-assessment.service.js';
import { cleanIntegrationDatabase, integrationDatabasePool } from './helpers/integration-test-database.js';

describe('WeeklyAssessment integration',
    () => {
        beforeEach(
            async () => {
                await cleanIntegrationDatabase();
            }
        );

        async function createStudyArea(
            weeklyGoalMinutes = 600
        ): Promise<string> {
            const result =
                await integrationDatabasePool.query<{
                    id: string;
                }>(
                    `
                    INSERT INTO study_area (
                        name,
                        weekly_goal_minutes
                    )
                    VALUES (
                        $1,
                        $2
                    )
                    RETURNING id
                    `,
                    [
                        'Angular',
                        weeklyGoalMinutes
                    ]
                );

            const id =
                result.rows[0]?.id;

            if (!id) {
                throw new Error(
                    'StudyArea fixture was not created.'
                );
            }

            return id;
        }

        async function createStudyPlan(
            coefficient = 1.5
        ): Promise<string> {
            const result =
                await integrationDatabasePool.query<{
                    id: string;
                }>(
                    `
                    INSERT INTO study_plan (
                        name,
                        coefficient,
                        status
                    )
                    VALUES (
                        $1,
                        $2,
                        'active'
                    )
                    RETURNING id
                    `,
                    [
                        'Plano de integração',
                        coefficient
                    ]
                );

            const id =
                result.rows[0]?.id;

            if (!id) {
                throw new Error(
                    'StudyPlan fixture was not created.'
                );
            }

            return id;
        }

        async function createStudyAreaWeek(
            studyAreaId: string,
            studyPlanId: string,
            weekStartDate = '2026-08-17'
        ): Promise<string> {
            const result =
                await integrationDatabasePool.query<{
                    id: string;
                }>(
                    `
                    INSERT INTO study_area_week (
                        week_start_date,
                        study_area_id,
                        study_plan_id
                    )
                    VALUES (
                        $1,
                        $2,
                        $3
                    )
                    RETURNING id
                    `,
                    [
                        weekStartDate,
                        studyAreaId,
                        studyPlanId
                    ]
                );

            const id =
                result.rows[0]?.id;

            if (!id) {
                throw new Error(
                    'StudyAreaWeek fixture was not created.'
                );
            }

            return id;
        }

        async function createWeeklyAssessment(
            studyAreaWeekId: string,
            weekGoal: number,
            minutesStudied: number,
            goalAchieved: boolean
        ): Promise<string> {
            const result =
                await integrationDatabasePool.query<{
                    id: string;
                }>(
                    `
                    INSERT INTO weekly_assessment (
                        study_area_week_id,
                        week_goal,
                        minutes_studied,
                        goal_achieved
                    )
                    VALUES (
                        $1,
                        $2,
                        $3,
                        $4
                    )
                    RETURNING id
                    `,
                    [
                        studyAreaWeekId,
                        weekGoal,
                        minutesStudied,
                        goalAchieved
                    ]
                );

            const id =
                result.rows[0]?.id;

            if (!id) {
                throw new Error(
                    'WeeklyAssessment fixture was not created.'
                );
            }

            return id;
        }

        function createService(): WeeklyAssessmentService {
            const assessmentRepository =
                new WeeklyAssessmentRepository(
                    integrationDatabasePool
                );

            const studyAreaWeekRepository =
                new StudyAreaWeekRepository(
                    integrationDatabasePool
                );

            return new WeeklyAssessmentService(
                assessmentRepository,
                studyAreaWeekRepository
            );
        }

        it(
            'deve retornar a WeeklyAssessment persistida para uma StudyAreaWeek existente',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        600
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    900,
                    600,
                    false
                );

                const service =
                    createService();

                const assessment =
                    await service.findByStudyAreaWeekId(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual({
                        id:
                            expect.any(
                                String
                            ),
                        studyAreaWeekId,
                        weekGoal:
                            900,
                        minutesStudied:
                            600,
                        goalAchieved:
                            false
                    });
            }
        );

        it(
            'deve preservar goal_achieved quando a avaliação persistida informa que a meta foi atingida',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        1000
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500,
                    1500,
                    true
                );

                const service =
                    createService();

                const assessment =
                    await service.findByStudyAreaWeekId(
                        studyAreaWeekId
                    );

                expect(
                    assessment.weekGoal
                ).toBe(1500);

                expect(
                    assessment.minutesStudied
                ).toBe(1500);

                expect(
                    assessment.goalAchieved
                ).toBe(true);
            }
        );

        it(
            'deve preservar goal_achieved como false quando minutes_studied for menor que week_goal',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        1000
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500,
                    1499,
                    false
                );

                const service =
                    createService();

                const assessment =
                    await service.findByStudyAreaWeekId(
                        studyAreaWeekId
                    );

                expect(
                    assessment.minutesStudied
                ).toBe(1499);

                expect(
                    assessment.weekGoal
                ).toBe(1500);

                expect(
                    assessment.goalAchieved
                ).toBe(false);
            }
        );

        it(
            'deve rejeitar quando a StudyAreaWeek não existir',
            async () => {
                const service =
                    createService();

                const missingStudyAreaWeekId =
                    '550e8400-e29b-41d4-a716-446655440000';

                await expect(
                    service.findByStudyAreaWeekId(
                        missingStudyAreaWeekId
                    )
                ).rejects.toMatchObject({
                    entity:
                        'StudyAreaWeek',
                    id:
                        missingStudyAreaWeekId
                });
            }
        );

        it(
            'deve rejeitar quando a StudyAreaWeek existir mas não possuir WeeklyAssessment',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        600
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                const service =
                    createService();

                await expect(
                    service.findByStudyAreaWeekId(
                        studyAreaWeekId
                    )
                ).rejects.toMatchObject({
                    entity:
                        'WeeklyAssessment',
                    id:
                        studyAreaWeekId
                });
            }
        );

        it(
            'deve preservar week_goal como snapshot mesmo após alteração da meta padrão da StudyArea',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        600
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    900,
                    600,
                    false
                );

                await integrationDatabasePool.query(
                    `
                    UPDATE study_area
                    SET weekly_goal_minutes = $1
                    WHERE id = $2
                    `,
                    [
                        1200,
                        studyAreaId
                    ]
                );

                const service =
                    createService();

                const assessment =
                    await service.findByStudyAreaWeekId(
                        studyAreaWeekId
                    );

                expect(
                    assessment.weekGoal
                ).toBe(900);

                expect(
                    assessment.minutesStudied
                ).toBe(600);

                expect(
                    assessment.goalAchieved
                ).toBe(false);
            }
        );

        it(
            'deve impedir duas WeeklyAssessments para a mesma StudyAreaWeek',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        600
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    900,
                    0,
                    false
                );

                await expect(
                    integrationDatabasePool.query(
                        `
                        INSERT INTO weekly_assessment (
                            study_area_week_id,
                            week_goal,
                            minutes_studied,
                            goal_achieved
                        )
                        VALUES (
                            $1,
                            $2,
                            $3,
                            $4
                        )
                        `,
                        [
                            studyAreaWeekId,
                            900,
                            0,
                            false
                        ]
                    )
                ).rejects.toThrow();
            }
        );

        it(
            'deve rejeitar week_goal menor ou igual a zero no PostgreSQL',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        600
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await expect(
                    integrationDatabasePool.query(
                        `
                        INSERT INTO weekly_assessment (
                            study_area_week_id,
                            week_goal,
                            minutes_studied,
                            goal_achieved
                        )
                        VALUES (
                            $1,
                            0,
                            0,
                            false
                        )
                        `,
                        [
                            studyAreaWeekId
                        ]
                    )
                ).rejects.toThrow();
            }
        );

        it(
            'deve rejeitar minutes_studied negativo no PostgreSQL',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        600
                    );

                const studyPlanId =
                    await createStudyPlan(
                        1.5
                    );

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await expect(
                    integrationDatabasePool.query(
                        `
                        INSERT INTO weekly_assessment (
                            study_area_week_id,
                            week_goal,
                            minutes_studied,
                            goal_achieved
                        )
                        VALUES (
                            $1,
                            $2,
                            -1,
                            false
                        )
                        `,
                        [
                            studyAreaWeekId,
                            900
                        ]
                    )
                ).rejects.toThrow();
            }
        );
    }
);