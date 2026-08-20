import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it
} from 'vitest';

import type { PoolClient } from 'pg';

import { StudyAreaRepository } from '../../repositories/study-area.repository.js';
import { StudyAreaWeekRepository } from '../../repositories/study-area-week.repository.js';
import { StudyPlanRepository } from '../../repositories/study-plan.repository.js';
import { WeeklyAssessmentRepository } from '../../repositories/weekly-assessment.repository.js';

import { StudyAreaWeekService } from '../../services/study-area-week.service.js';

import {
    cleanIntegrationDatabase,
    integrationDatabasePool
} from './helpers/integration-test-database.js';

const CURRENT_WEEK_START = '2026-08-17';

const CURRENT_MONDAY_NOON =
    new Date('2026-08-17T12:00:00-03:00');

let databaseClient: PoolClient;

function createStudyAreaWeekService(): StudyAreaWeekService {
    const studyAreaWeekRepository =
        new StudyAreaWeekRepository(
            databaseClient
        );

    const studyAreaRepository =
        new StudyAreaRepository(
            databaseClient
        );

    const studyPlanRepository =
        new StudyPlanRepository(
            databaseClient
        );

    const assessmentRepository =
        new WeeklyAssessmentRepository(
            databaseClient
        );

    return new StudyAreaWeekService(
        integrationDatabasePool,
        studyAreaWeekRepository,
        studyAreaRepository,
        studyPlanRepository,
        assessmentRepository,
        () => CURRENT_MONDAY_NOON
    );
}

async function createStudyArea(
    name: string,
    weeklyGoalMinutes: number
): Promise<string> {
    const result =
        await databaseClient.query<{
            id: string;
        }>(
            `
            INSERT INTO study_area (
                name,
                weekly_goal_minutes
            )
            VALUES ($1, $2)
            RETURNING id
            `,
            [
                name,
                weeklyGoalMinutes
            ]
        );

    const id =
        result.rows[0]?.id;

    if (!id) {
        throw new Error(
            'StudyArea was not created.'
        );
    }

    return id;
}

async function createStudyPlan(
    name: string,
    coefficient: number,
    status: 'active' | 'inactive'
): Promise<string> {
    const result =
        await databaseClient.query<{
            id: string;
        }>(
            `
            INSERT INTO study_plan (
                name,
                coefficient,
                status
            )
            VALUES ($1, $2, $3)
            RETURNING id
            `,
            [
                name,
                coefficient,
                status
            ]
        );

    const id =
        result.rows[0]?.id;

    if (!id) {
        throw new Error(
            'StudyPlan was not created.'
        );
    }

    return id;
}

describe(
    'StudyAreaWeek integration',
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
            'deve criar uma StudyAreaWeek e sua WeeklyAssessment no PostgreSQL',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const result =
                    await service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                expect(
                    result.studyAreaWeek.id
                ).toMatch(
                    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                );

                expect(
                    result.studyAreaWeek.weekStartDate
                ).toBe(
                    CURRENT_WEEK_START
                );

                expect(
                    result.studyAreaWeek.studyAreaId
                ).toBe(
                    studyAreaId
                );

                expect(
                    result.studyAreaWeek.studyPlanId
                ).toBe(
                    studyPlanId
                );

                expect(
                    result.assessment.weekGoal
                ).toBe(1500);

                expect(
                    result.assessment.minutesStudied
                ).toBe(0);

                expect(
                    result.assessment.goalAchieved
                ).toBe(false);

                const studyAreaWeekResult =
                    await databaseClient.query<{
                        id: string;
                        week_start_date: string;
                        study_area_id: string;
                        study_plan_id: string;
                    }>(
                        `
                        SELECT
                            id,
                            week_start_date::text AS week_start_date,
                            study_area_id,
                            study_plan_id
                        FROM study_area_week
                        WHERE id = $1
                        `,
                        [
                            result.studyAreaWeek.id
                        ]
                    );

                expect(
                    studyAreaWeekResult.rows
                ).toHaveLength(1);

                expect(
                    studyAreaWeekResult.rows[0]
                ).toEqual({
                    id:
                        result.studyAreaWeek.id,
                    week_start_date:
                        CURRENT_WEEK_START,
                    study_area_id:
                        studyAreaId,
                    study_plan_id:
                        studyPlanId
                });

                const assessmentResult =
                    await databaseClient.query<{
                        id: string;
                        study_area_week_id: string;
                        week_goal: number;
                        minutes_studied: number;
                        goal_achieved: boolean;
                    }>(
                        `
                        SELECT
                            id,
                            study_area_week_id,
                            week_goal,
                            minutes_studied,
                            goal_achieved
                        FROM weekly_assessment
                        WHERE study_area_week_id = $1
                        `,
                        [
                            result.studyAreaWeek.id
                        ]
                    );

                expect(
                    assessmentResult.rows
                ).toHaveLength(1);

                expect(
                    assessmentResult.rows[0]
                ).toEqual({
                    id:
                        result.assessment.id,
                    study_area_week_id:
                        result.studyAreaWeek.id,
                    week_goal: 1500,
                    minutes_studied: 0,
                    goal_achieved: false
                });
            }
        );

        it(
            'deve calcular a meta efetiva usando weekly_goal_minutes × coefficient',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1000
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano 1.5x',
                        1.5,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const result =
                    await service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                expect(
                    result.assessment.weekGoal
                ).toBe(1500);

                const databaseResult =
                    await databaseClient.query<{
                        week_goal: number;
                    }>(
                        `
                        SELECT week_goal
                        FROM weekly_assessment
                        WHERE study_area_week_id = $1
                        `,
                        [
                            result.studyAreaWeek.id
                        ]
                    );

                expect(
                    databaseResult.rows[0]?.week_goal
                ).toBe(1500);
            }
        );

        it(
            'deve rejeitar configuração quando a meta efetiva total for menor que 1500 minutos',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1000
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano 1x',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                await expect(
                    service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    })
                ).rejects.toThrowError(
                    'The effective weekly goal must be at least 1500 minutes.'
                );

                const studyAreaWeekResult =
                    await databaseClient.query(
                        `
                        SELECT id
                        FROM study_area_week
                        `
                    );

                expect(
                    studyAreaWeekResult.rows
                ).toHaveLength(0);

                const assessmentResult =
                    await databaseClient.query(
                        `
                        SELECT id
                        FROM weekly_assessment
                        `
                    );

                expect(
                    assessmentResult.rows
                ).toHaveLength(0);
            }
        );

        it(
            'deve rejeitar StudyPlan inativo',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano inativo',
                        1,
                        'inactive'
                    );

                const service =
                    createStudyAreaWeekService();

                await expect(
                    service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    })
                ).rejects.toThrowError(
                    'Inactive study plans cannot be selected.'
                );

                const result =
                    await databaseClient.query(
                        `
                        SELECT id
                        FROM study_area_week
                        `
                    );

                expect(
                    result.rows
                ).toHaveLength(0);
            }
        );

        it(
            'deve rejeitar configuração fora da segunda-feira',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    new StudyAreaWeekService(
                        integrationDatabasePool,
                        new StudyAreaWeekRepository(
                            databaseClient
                        ),
                        new StudyAreaRepository(
                            databaseClient
                        ),
                        new StudyPlanRepository(
                            databaseClient
                        ),
                        new WeeklyAssessmentRepository(
                            databaseClient
                        ),
                        () =>
                            new Date(
                                '2026-08-18T12:00:00-03:00'
                            )
                    );

                await expect(
                    service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    })
                ).rejects.toThrowError(
                    'Weekly configuration can only be changed on Monday.'
                );

                const result =
                    await databaseClient.query(
                        `
                        SELECT id
                        FROM study_area_week
                        `
                    );

                expect(
                    result.rows
                ).toHaveLength(0);
            }
        );

        it(
            'deve rejeitar configuração para uma semana diferente da semana corrente',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                await expect(
                    service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            '2026-08-10'
                    })
                ).rejects.toThrowError(
                    'Weekly configuration can only be changed for the current week.'
                );

                const result =
                    await databaseClient.query(
                        `
                        SELECT id
                        FROM study_area_week
                        `
                    );

                expect(
                    result.rows
                ).toHaveLength(0);
            }
        );

        it(
            'deve impedir a mesma StudyArea duas vezes na mesma semana',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const first =
                    await service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                expect(
                    first.studyAreaWeek.studyAreaId
                ).toBe(
                    studyAreaId
                );

                await expect(
                    service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    })
                ).rejects.toThrowError(
                    'The study area is already configured for this week.'
                );

                const result =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM study_area_week
                        WHERE study_area_id = $1
                            AND week_start_date = $2
                        `,
                        [
                            studyAreaId,
                            CURRENT_WEEK_START
                        ]
                    );

                expect(
                    result.rows[0]?.count
                ).toBe('1');

                const assessmentResult =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM weekly_assessment
                        WHERE study_area_week_id = $1
                        `,
                        [
                            first.studyAreaWeek.id
                        ]
                    );

                expect(
                    assessmentResult.rows[0]?.count
                ).toBe('1');
            }
        );

        it(
            'deve permitir áreas diferentes na mesma semana',
            async () => {
                const firstAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const secondAreaId =
                    await createStudyArea(
                        'TypeScript',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const first =
                    await service.create({
                        studyAreaId:
                            firstAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                const second =
                    await service.create({
                        studyAreaId:
                            secondAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                expect(
                    first.studyAreaWeek.studyAreaId
                ).toBe(
                    firstAreaId
                );

                expect(
                    second.studyAreaWeek.studyAreaId
                ).toBe(
                    secondAreaId
                );

                const result =
                    await databaseClient.query<{
                        study_area_id: string;
                    }>(
                        `
                        SELECT study_area_id
                        FROM study_area_week
                        WHERE week_start_date = $1
                        ORDER BY study_area_id
                        `,
                        [
                            CURRENT_WEEK_START
                        ]
                    );

                expect(
                    result.rows.map(
                        row =>
                            row.study_area_id
                    )
                ).toEqual(
                    [
                        firstAreaId,
                        secondAreaId
                    ].sort()
                );
            }
        );

        it(
            'deve buscar uma StudyAreaWeek persistida pelo id',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const created =
                    await service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                const result =
                    await service.findById(
                        created.studyAreaWeek.id
                    );

                expect(result)
                    .toEqual(
                        created.studyAreaWeek
                    );
            }
        );

        it(
            'deve buscar uma StudyAreaWeek pela área e semana',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const created =
                    await service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                const result =
                    await service.findByAreaAndWeek(
                        studyAreaId,
                        CURRENT_WEEK_START
                    );

                expect(result)
                    .toEqual(
                        created.studyAreaWeek
                    );
            }
        );

        it(
            'deve retornar todas as configurações da semana',
            async () => {
                const firstAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const secondAreaId =
                    await createStudyArea(
                        'TypeScript',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                await service.create({
                    studyAreaId:
                        firstAreaId,
                    studyPlanId,
                    weekStartDate:
                        CURRENT_WEEK_START
                });

                await service.create({
                    studyAreaId:
                        secondAreaId,
                    studyPlanId,
                    weekStartDate:
                        CURRENT_WEEK_START
                });

                const result =
                    await service.findByWeekStartDate(
                        CURRENT_WEEK_START
                    );

                expect(
                    result
                ).toHaveLength(2);

                expect(
                    result.map(
                        item =>
                            item.studyAreaId
                    )
                ).toEqual(
                    [
                        firstAreaId,
                        secondAreaId
                    ].sort()
                );
            }
        );

        it(
            'deve preservar uma única WeeklyAssessment para cada StudyAreaWeek',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const created =
                    await service.create({
                        studyAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    });

                const result =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM weekly_assessment
                        WHERE study_area_week_id = $1
                        `,
                        [
                            created.studyAreaWeek.id
                        ]
                    );

                expect(
                    result.rows[0]?.count
                ).toBe('1');

                await expect(
                    databaseClient.query(
                        `
                        INSERT INTO weekly_assessment (
                            study_area_week_id,
                            week_goal,
                            minutes_studied,
                            goal_achieved
                        )
                        VALUES (
                            $1,
                            1500,
                            0,
                            false
                        )
                        `,
                        [
                            created.studyAreaWeek.id
                        ]
                    )
                ).rejects.toThrow();

                const afterAttempt =
                    await databaseClient.query<{
                        count: string;
                    }>(
                        `
                        SELECT COUNT(*) AS count
                        FROM weekly_assessment
                        WHERE study_area_week_id = $1
                        `,
                        [
                            created.studyAreaWeek.id
                        ]
                    );

                expect(
                    afterAttempt.rows[0]?.count
                ).toBe('1');
            }
        );

        it(
            'deve rejeitar StudyArea inexistente sem criar StudyAreaWeek',
            async () => {
                const studyPlanId =
                    await createStudyPlan(
                        'Plano padrão',
                        1,
                        'active'
                    );

                const service =
                    createStudyAreaWeekService();

                const missingAreaId =
                    '550e8400-e29b-41d4-a716-446655440000';

                await expect(
                    service.create({
                        studyAreaId:
                            missingAreaId,
                        studyPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    })
                ).rejects.toThrowError(
                    `StudyArea with id "${missingAreaId}" was not found.`
                );

                const result =
                    await databaseClient.query(
                        `
                        SELECT id
                        FROM study_area_week
                        `
                    );

                expect(
                    result.rows
                ).toHaveLength(0);
            }
        );

        it(
            'deve rejeitar StudyPlan inexistente sem criar StudyAreaWeek',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const missingPlanId =
                    '550e8400-e29b-41d4-a716-446655440001';

                const service =
                    createStudyAreaWeekService();

                await expect(
                    service.create({
                        studyAreaId,
                        studyPlanId:
                            missingPlanId,
                        weekStartDate:
                            CURRENT_WEEK_START
                    })
                ).rejects.toThrowError(
                    `StudyPlan with id "${missingPlanId}" was not found.`
                );

                const result =
                    await databaseClient.query(
                        `
                        SELECT id
                        FROM study_area_week
                        `
                    );

                expect(
                    result.rows
                ).toHaveLength(0);
            }
        );
    }
);