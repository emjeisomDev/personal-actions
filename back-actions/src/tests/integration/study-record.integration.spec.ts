import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it
} from 'vitest';

import type { PoolClient } from 'pg';

import type {
    WeeklyAssessment
} from '../../models/weekly-assessment.model.js';

import {
    StudyAreaWeekRepository
} from '../../repositories/study-area-week.repository.js';

import {
    StudyRecordRepository
} from '../../repositories/study-record.repository.js';

import {
    WeeklyAssessmentRepository
} from '../../repositories/weekly-assessment.repository.js';

import {
    StudyRecordService
} from '../../services/study-record.service.js';

import {
    cleanIntegrationDatabase,
    integrationDatabasePool
} from './helpers/integration-test-database.js';

const CURRENT_WEEK_START =
    '2026-08-17';

const PREVIOUS_WEEK_START =
    '2026-08-10';

const CURRENT_MONDAY_NOON =
    new Date(
        '2026-08-17T12:00:00-03:00'
    );

let databaseClient: PoolClient;

async function createStudyArea(
    name = 'Angular',
    weeklyGoalMinutes = 1500
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
    name = 'Plano padrão',
    coefficient = 1,
    status: 'active' | 'inactive' = 'active'
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

async function createStudyAreaWeek(
    studyAreaId: string,
    studyPlanId: string,
    weekStartDate =
        CURRENT_WEEK_START
): Promise<string> {
    const result =
        await databaseClient.query<{
            id: string;
        }>(
            `
            INSERT INTO study_area_week (
                week_start_date,
                study_area_id,
                study_plan_id
            )
            VALUES ($1, $2, $3)
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
            'StudyAreaWeek was not created.'
        );
    }

    return id;
}

async function createWeeklyAssessment(
    studyAreaWeekId: string,
    weekGoal = 1500
): Promise<string> {
    const result =
        await databaseClient.query<{
            id: string;
        }>(
            `
            INSERT INTO weekly_assessment (
                study_area_week_id,
                week_goal,
                minutes_studied,
                goal_achieved
            )
            VALUES ($1, $2, 0, false)
            RETURNING id
            `,
            [
                studyAreaWeekId,
                weekGoal
            ]
        );

    const id =
        result.rows[0]?.id;

    if (!id) {
        throw new Error(
            'WeeklyAssessment was not created.'
        );
    }

    return id;
}

function createStudyRecordService(
    weeklyAssessmentRepository:
        WeeklyAssessmentRepository =
        new WeeklyAssessmentRepository(
            databaseClient
        )
): StudyRecordService {
    return new StudyRecordService(
        integrationDatabasePool,
        new StudyAreaWeekRepository(
            databaseClient
        ),
        new StudyRecordRepository(
            databaseClient
        ),
        weeklyAssessmentRepository,
        () =>
            CURRENT_MONDAY_NOON
    );
}

async function getStudyRecords(
    studyAreaWeekId: string
): Promise<{
    id: string;
    date: string;
    minutes: number;
    created_at: Date;
    study_area_week_id: string;
}[]> {
    const result =
        await databaseClient.query<{
            id: string;
            date: string;
            minutes: number;
            created_at: Date;
            study_area_week_id: string;
        }>(
            `
            SELECT
                id,
                date::text AS date,
                minutes,
                created_at,
                study_area_week_id
            FROM study_record
            WHERE study_area_week_id = $1
            ORDER BY created_at ASC, id ASC
            `,
            [
                studyAreaWeekId
            ]
        );

    return result.rows;
}

async function getWeeklyAssessment(
    studyAreaWeekId: string
): Promise<{
    id: string;
    week_goal: number;
    minutes_studied: number;
    goal_achieved: boolean;
} | null> {
    const result =
        await databaseClient.query<{
            id: string;
            week_goal: number;
            minutes_studied: number;
            goal_achieved: boolean;
        }>(
            `
            SELECT
                id,
                week_goal,
                minutes_studied,
                goal_achieved
            FROM weekly_assessment
            WHERE study_area_week_id = $1
            `,
            [
                studyAreaWeekId
            ]
        );

    return result.rows[0] ?? null;
}

class FailingWeeklyAssessmentRepository extends WeeklyAssessmentRepository {
    public override async update(
        id: string,
        assessment: Omit<WeeklyAssessment, 'id'>
    ): Promise<WeeklyAssessment | null> {
        void id;
        void assessment;

        return null;
    }
}

describe(
    'StudyRecord integration',
    () => {
        beforeEach(
            async () => {
                await cleanIntegrationDatabase();

                databaseClient =
                    await integrationDatabasePool
                        .connect();
            }
        );

        afterEach(
            async () => {
                databaseClient.release();
            }
        );

        it(
            'deve criar um StudyRecord e atualizar WeeklyAssessment na mesma operação',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                const result =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            1500,
                        studyAreaWeekId
                    });

                expect(result.id)
                    .toMatch(
                        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
                    );

                expect(result.date)
                    .toBe(
                        CURRENT_WEEK_START
                    );

                expect(result.minutes)
                    .toBe(1500);

                expect(
                    result.studyAreaWeekId
                ).toBe(
                    studyAreaWeekId
                );

                expect(result.createdAt)
                    .toBeInstanceOf(Date);

                const records =
                    await getStudyRecords(
                        studyAreaWeekId
                    );

                expect(records)
                    .toHaveLength(1);

                expect(records[0]?.date)
                    .toBe(
                        CURRENT_WEEK_START
                    );

                expect(records[0]?.minutes)
                    .toBe(1500);

                const assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            week_goal:
                                1500,
                            minutes_studied:
                                1500,
                            goal_achieved:
                                true
                        })
                    );
            }
        );

        it(
            'deve permitir múltiplos StudyRecords no mesmo dia',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                const first =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            600,
                        studyAreaWeekId
                    });

                const second =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            900,
                        studyAreaWeekId
                    });

                expect(first.id)
                    .not.toBe(second.id);

                const records =
                    await getStudyRecords(
                        studyAreaWeekId
                    );

                expect(records)
                    .toHaveLength(2);

                expect(
                    records.map(
                        record =>
                            record.date
                    )
                ).toEqual([
                    CURRENT_WEEK_START,
                    CURRENT_WEEK_START
                ]);

                expect(
                    records.map(
                        record =>
                            record.minutes
                    )
                ).toEqual([
                    600,
                    900
                ]);

                const assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            week_goal:
                                1500,
                            minutes_studied:
                                1500,
                            goal_achieved:
                                true
                        })
                    );
            }
        );

        it(
            'deve gerar created_at pelo banco sem depender do payload do frontend',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                const result =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            30,
                        studyAreaWeekId
                    });

                expect(result.createdAt)
                    .toBeInstanceOf(Date);

                const records =
                    await getStudyRecords(
                        studyAreaWeekId
                    );

                expect(
                    records[0]?.created_at
                ).toBeInstanceOf(Date);

                expect(
                    records[0]?.created_at
                        .getTime()
                ).toBe(
                    result.createdAt.getTime()
                );
            }
        );

        it(
            'deve consultar os StudyRecords persistidos de uma StudyAreaWeek',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                await service.create({
                    date:
                        CURRENT_WEEK_START,
                    minutes:
                        30,
                    studyAreaWeekId
                });

                await service.create({
                    date:
                        CURRENT_WEEK_START,
                    minutes:
                        45,
                    studyAreaWeekId
                });

                const records =
                    await service
                        .findByStudyAreaWeekId(
                            studyAreaWeekId
                        );

                expect(records)
                    .toHaveLength(2);

                expect(
                    records.map(
                        record =>
                            record.minutes
                    )
                ).toEqual([
                    30,
                    45
                ]);

                expect(
                    records.every(
                        record =>
                            record.studyAreaWeekId ===
                            studyAreaWeekId
                    )
                ).toBe(true);
            }
        );

        it(
            'deve rejeitar consulta para StudyAreaWeek inexistente',
            async () => {
                const service =
                    createStudyRecordService();

                const missingId =
                    '550e8400-e29b-41d4-a716-446655440000';

                await expect(
                    service
                        .findByStudyAreaWeekId(
                            missingId
                        )
                ).rejects.toThrowError(
                    `StudyAreaWeek with id "${missingId}" was not found.`
                );
            }
        );

        it(
            'deve buscar um StudyRecord existente pelo id',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                const created =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            60,
                        studyAreaWeekId
                    });

                const found =
                    await service.findById(
                        created.id
                    );

                expect(found)
                    .toEqual(created);
            }
        );

        it(
            'deve rejeitar busca de StudyRecord inexistente',
            async () => {
                const service =
                    createStudyRecordService();

                const missingId =
                    '550e8400-e29b-41d4-a716-446655440001';

                await expect(
                    service.findById(
                        missingId
                    )
                ).rejects.toThrowError(
                    `StudyRecord with id "${missingId}" was not found.`
                );
            }
        );

        it(
            'deve remover o último StudyRecord seguindo LIFO',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                const first =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            600,
                        studyAreaWeekId
                    });

                const second =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            900,
                        studyAreaWeekId
                    });

                const removed =
                    await service.removeLatest(
                        studyAreaWeekId
                    );

                expect(removed.id)
                    .toBe(second.id);

                expect(removed.id)
                    .not.toBe(first.id);

                const records =
                    await getStudyRecords(
                        studyAreaWeekId
                    );

                expect(records)
                    .toHaveLength(1);

                expect(records[0]?.id)
                    .toBe(first.id);

                expect(records[0]?.minutes)
                    .toBe(600);

                const assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            week_goal:
                                1500,
                            minutes_studied:
                                600,
                            goal_achieved:
                                false
                        })
                    );
            }
        );

        it(
            'deve rejeitar remoção quando a StudyAreaWeek pertence a uma semana anterior',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId,
                        PREVIOUS_WEEK_START
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                await service.create({
                    date:
                        PREVIOUS_WEEK_START,
                    minutes:
                        60,
                    studyAreaWeekId
                });

                await expect(
                    service.removeLatest(
                        studyAreaWeekId
                    )
                ).rejects.toThrowError(
                    'Study records can only be removed from the current week.'
                );

                const records =
                    await getStudyRecords(
                        studyAreaWeekId
                    );

                expect(records)
                    .toHaveLength(1);

                expect(records[0]?.minutes)
                    .toBe(60);
            }
        );

        it(
            'deve rejeitar remoção quando não existem StudyRecords',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                await expect(
                    service.removeLatest(
                        studyAreaWeekId
                    )
                ).rejects.toThrowError(
                    'There are no study records to remove.'
                );

                const assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            week_goal:
                                1500,
                            minutes_studied:
                                0,
                            goal_achieved:
                                false
                        })
                    );
            }
        );

        it(
            'deve fazer rollback da inclusão quando WeeklyAssessment não puder ser sincronizada',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                const service =
                    createStudyRecordService();

                await expect(
                    service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            60,
                        studyAreaWeekId
                    })
                ).rejects.toMatchObject({
                    message:
                        'Weekly assessment could not be synchronized.',
                    code:
                        'ASSESSMENT_SYNC_FAILED'
                });

                const records =
                    await getStudyRecords(
                        studyAreaWeekId
                    );

                expect(records)
                    .toHaveLength(0);

                const assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toBeNull();
            }
        );

        it(
            'deve fazer rollback da exclusão quando WeeklyAssessment não puder ser sincronizada',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                const created =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            60,
                        studyAreaWeekId
                    });

                const failingService =
                    createStudyRecordService(
                        new FailingWeeklyAssessmentRepository(
                            databaseClient
                        )
                    );

                await expect(
                    failingService.removeLatest(
                        studyAreaWeekId
                    )
                ).rejects.toMatchObject({
                    message:
                        'Weekly assessment could not be synchronized.',
                    code:
                        'ASSESSMENT_SYNC_FAILED'
                });

                const records =
                    await getStudyRecords(
                        studyAreaWeekId
                    );

                expect(records)
                    .toHaveLength(1);

                expect(records[0]?.id)
                    .toBe(created.id);

                expect(records[0]?.minutes)
                    .toBe(60);

                const assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            week_goal:
                                1500,
                            minutes_studied:
                                60,
                            goal_achieved:
                                false
                        })
                    );
            }
        );

        it(
            'deve recalcular goal_achieved após atingir e depois deixar de atingir a meta',
            async () => {
                const studyAreaId =
                    await createStudyArea(
                        'Angular',
                        1500
                    );

                const studyPlanId =
                    await createStudyPlan();

                const studyAreaWeekId =
                    await createStudyAreaWeek(
                        studyAreaId,
                        studyPlanId
                    );

                await createWeeklyAssessment(
                    studyAreaWeekId,
                    1500
                );

                const service =
                    createStudyRecordService();

                const first =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            1000,
                        studyAreaWeekId
                    });

                expect(first.minutes)
                    .toBe(1000);

                let assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            minutes_studied:
                                1000,
                            goal_achieved:
                                false
                        })
                    );

                const second =
                    await service.create({
                        date:
                            CURRENT_WEEK_START,
                        minutes:
                            500,
                        studyAreaWeekId
                    });

                expect(second.minutes)
                    .toBe(500);

                assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            minutes_studied:
                                1500,
                            goal_achieved:
                                true
                        })
                    );

                const removed =
                    await service.removeLatest(
                        studyAreaWeekId
                    );

                expect(removed.id)
                    .toBe(second.id);

                assessment =
                    await getWeeklyAssessment(
                        studyAreaWeekId
                    );

                expect(assessment)
                    .toEqual(
                        expect.objectContaining({
                            minutes_studied:
                                1000,
                            goal_achieved:
                                false
                        })
                    );
            }
        );
    }
);