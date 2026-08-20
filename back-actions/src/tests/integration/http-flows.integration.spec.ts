import dotenv from 'dotenv';

import {
    beforeAll,
    beforeEach,
    afterAll,
    describe,
    expect,
    it
} from 'vitest';

import type { Express } from 'express';
import type { Server } from 'node:http';

dotenv.config({
    path: '.env.test'
});

process.env['NODE_ENV'] = 'test';

interface HttpResponse<T = unknown> {
    status: number;
    body: T;
}

interface ApiError {
    error: {
        code: string;
        message: string;
        issues?: Array<{
            field: string;
            message: string;
        }>;
    };
}

interface CreatedEntity {
    id: string;
    [key: string]: unknown;
}

describe(
    'HTTP complete integration flows',
    () => {
        let application:
            Express;

        let server:
            Server;

        let databasePool:
            import('pg').Pool;

        let baseUrl:
            string;

        async function request<T = unknown>(
            path: string,
            options: RequestInit = {}
        ): Promise<HttpResponse<T>> {
            const response =
                await fetch(
                    `${baseUrl}${path}`,
                    {
                        ...options,
                        headers: {
                            'Content-Type':
                                'application/json',
                            ...(options.headers ?? {})
                        }
                    }
                );

            const contentType =
                response.headers.get(
                    'content-type'
                );

            const body =
                contentType?.includes(
                    'application/json'
                )
                    ? await response.json()
                    : null;

            return {
                status:
                    response.status,
                body:
                    body as T
            };
        }

        async function createArea(
            name = 'Angular',
            weeklyGoalMinutes = 1000
        ): Promise<CreatedEntity> {
            const response =
                await request<CreatedEntity>(
                    '/api/study-areas',
                    {
                        method:
                            'POST',
                        body:
                            JSON.stringify({
                                name,
                                weeklyGoalMinutes
                            })
                    }
                );

            expect(
                response.status
            ).toBe(201);

            return response.body;
        }

        async function createPlan(
            name = 'Plano de integração',
            coefficient = 1.5
        ): Promise<CreatedEntity> {
            const response =
                await request<CreatedEntity>(
                    '/api/study-plans',
                    {
                        method:
                            'POST',
                        body:
                            JSON.stringify({
                                name,
                                coefficient,
                                status:
                                    'active'
                            })
                    }
                );

            expect(
                response.status
            ).toBe(201);

            return response.body;
        }

        async function currentWeekStart(): Promise<string> {
            const result =
                await databasePool.query<{
                    week_start_date: string;
                }>(
                    `
                    SELECT
                        (
                            CURRENT_DATE
                            -
                            (
                                EXTRACT(
                                    DOW
                                    FROM CURRENT_DATE
                                )::integer
                            )::integer
                            +
                            CASE
                                WHEN EXTRACT(
                                    DOW
                                    FROM CURRENT_DATE
                                )::integer = 0
                                THEN -6
                                ELSE 1
                            END
                        )::date::text
                        AS week_start_date
                    `
                );

            const weekStart =
                result.rows[0]?.week_start_date;

            if (!weekStart) {
                throw new Error(
                    'Could not determine current week start date.'
                );
            }

            return weekStart;
        }

        async function previousWeekStart(): Promise<string> {
            const current =
                await currentWeekStart();

            const date =
                new Date(
                    `${current}T00:00:00Z`
                );

            date.setUTCDate(
                date.getUTCDate() - 7
            );

            return date
                .toISOString()
                .slice(
                    0,
                    10
                );
        }

        async function createWeekFixture(
            studyAreaId: string,
            studyPlanId: string,
            weekStartDate: string,
            weekGoal = 1500
        ): Promise<{
            studyAreaWeekId: string;
            assessmentId: string;
        }> {
            const weekResult =
                await databasePool.query<{
                    id: string;
                }>(
                    `
                    INSERT INTO study_area_week (
                        study_area_id,
                        study_plan_id,
                        week_start_date
                    )
                    VALUES (
                        $1,
                        $2,
                        $3
                    )
                    RETURNING id
                    `,
                    [
                        studyAreaId,
                        studyPlanId,
                        weekStartDate
                    ]
                );

            const studyAreaWeekId =
                weekResult.rows[0]?.id;

            if (!studyAreaWeekId) {
                throw new Error(
                    'StudyAreaWeek fixture was not created.'
                );
            }

            const assessmentResult =
                await databasePool.query<{
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
                        0,
                        false
                    )
                    RETURNING id
                    `,
                    [
                        studyAreaWeekId,
                        weekGoal
                    ]
                );

            const assessmentId =
                assessmentResult.rows[0]?.id;

            if (!assessmentId) {
                throw new Error(
                    'WeeklyAssessment fixture was not created.'
                );
            }

            return {
                studyAreaWeekId,
                assessmentId
            };
        }

        async function cleanDatabase(): Promise<void> {
            await databasePool.query(
                `
                TRUNCATE TABLE
                    weekly_assessment,
                    study_record,
                    study_area_week,
                    study_area,
                    study_plan
                RESTART IDENTITY
                CASCADE
                `
            );
        }

        beforeAll(
            async () => {
                const [
                    appModule,
                    databaseModule
                ] = await Promise.all([
                    import(
                        '../../app.js'
                    ),
                    import(
                        '../../config/database.js'
                    )
                ]);

                application =
                    appModule.app;

                databasePool =
                    databaseModule.databasePool;

                await databasePool.query(
                    'SELECT 1'
                );

                await new Promise<void>(
                    (
                        resolve,
                        reject
                    ) => {
                        server =
                            application.listen(
                                0,
                                '127.0.0.1',
                                () => {
                                    resolve();
                                }
                            );

                        server.on(
                            'error',
                            reject
                        );
                    }
                );

                const address =
                    server.address();

                if (
                    address === null ||
                    typeof address ===
                        'string'
                ) {
                    throw new Error(
                        'Could not determine HTTP test server address.'
                    );
                }

                baseUrl =
                    `http://127.0.0.1:${address.port}`;
            }
        );

        beforeEach(
            async () => {
                await cleanDatabase();
            }
        );

        afterAll(
            async () => {
                await new Promise<void>(
                    (
                        resolve,
                        reject
                    ) => {
                        server.close(
                            (error) => {
                                if (error) {
                                    reject(
                                        error
                                    );
                                    return;
                                }

                                resolve();
                            }
                        );
                    }
                );
            }
        );

        it(
            'deve expor health check com conexão PostgreSQL ativa',
            async () => {
                const response =
                    await request<{
                        status: string;
                        service: string;
                        environment: string;
                        database: string;
                    }>(
                        '/health'
                    );

                expect(
                    response.status
                ).toBe(200);

                expect(
                    response.body
                ).toEqual({
                    status:
                        'ok',
                    service:
                        'back-actions',
                    environment:
                        'test',
                    database:
                        'connected'
                });
            }
        );

        it(
            'deve executar o fluxo HTTP completo de StudyArea',
            async () => {
                const created =
                    await createArea(
                        'Angular',
                        1000
                    );

                expect(
                    created
                ).toMatchObject({
                    name:
                        'Angular',
                    weeklyGoalMinutes:
                        1000
                });

                const id =
                    String(
                        created.id
                    );

                const getResponse =
                    await request<CreatedEntity>(
                        `/api/study-areas/${id}`
                    );

                expect(
                    getResponse.status
                ).toBe(200);

                expect(
                    getResponse.body
                ).toMatchObject({
                    id,
                    name:
                        'Angular',
                    weeklyGoalMinutes:
                        1000
                });

                const updateResponse =
                    await request<CreatedEntity>(
                        `/api/study-areas/${id}`,
                        {
                            method:
                                'PUT',
                            body:
                                JSON.stringify({
                                    name:
                                        'Angular Avançado',
                                    weeklyGoalMinutes:
                                        1200
                                })
                        }
                    );

                expect(
                    updateResponse.status
                ).toBe(200);

                expect(
                    updateResponse.body
                ).toMatchObject({
                    id,
                    name:
                        'Angular Avançado',
                    weeklyGoalMinutes:
                        1200
                });

                const deleteResponse =
                    await request(
                        `/api/study-areas/${id}`,
                        {
                            method:
                                'DELETE'
                        }
                    );

                expect(
                    deleteResponse.status
                ).toBe(204);

                const missingResponse =
                    await request<ApiError>(
                        `/api/study-areas/${id}`
                    );

                expect(
                    missingResponse.status
                ).toBe(404);
            }
        );

        it(
            'deve validar StudyArea inválida antes de chegar ao service',
            async () => {
                const response =
                    await request<ApiError>(
                        '/api/study-areas',
                        {
                            method:
                                'POST',
                            body:
                                JSON.stringify({
                                    name:
                                        '',
                                    weeklyGoalMinutes:
                                        0
                                })
                        }
                    );

                expect(
                    response.status
                ).toBe(422);

                expect(
                    response.body.error.code
                ).toBe(
                    'VALIDATION_ERROR'
                );

                expect(
                    response.body.error.issues
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                'name'
                        }),
                        expect.objectContaining({
                            field:
                                'weeklyGoalMinutes'
                        })
                    ])
                );
            }
        );

        it(
            'deve executar o fluxo HTTP de StudyPlan e disponibilizar somente planos ativos no endpoint active',
            async () => {
                const active =
                    await createPlan(
                        'Plano ativo',
                        1.5
                    );

                const inactiveResponse =
                    await request<CreatedEntity>(
                        '/api/study-plans',
                        {
                            method:
                                'POST',
                            body:
                                JSON.stringify({
                                    name:
                                        'Plano inativo',
                                    coefficient:
                                        2,
                                    status:
                                        'inactive'
                                })
                        }
                    );

                expect(
                    inactiveResponse.status
                ).toBe(201);

                const allResponse =
                    await request<CreatedEntity[]>(
                        '/api/study-plans'
                    );

                expect(
                    allResponse.status
                ).toBe(200);

                expect(
                    allResponse.body
                ).toHaveLength(2);

                const activeResponse =
                    await request<CreatedEntity[]>(
                        '/api/study-plans/active'
                    );

                expect(
                    activeResponse.status
                ).toBe(200);

                expect(
                    activeResponse.body
                ).toHaveLength(1);

                expect(
                    activeResponse.body[0]
                ).toMatchObject({
                    id:
                        String(
                            active.id
                        ),
                    status:
                        'active'
                });
            }
        );

        it(
            'deve validar UUID inválido no fluxo HTTP',
            async () => {
                const response =
                    await request<ApiError>(
                        '/api/study-plans/not-a-uuid'
                    );

                expect(
                    response.status
                ).toBe(422);

                expect(
                    response.body.error.code
                ).toBe(
                    'VALIDATION_ERROR'
                );

                expect(
                    response.body.error.issues
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                'params.id'
                        })
                    ])
                );
            }
        );

        it(
            'deve consultar StudyAreaWeek por id, área e semana através do HTTP',
            async () => {
                const area =
                    await createArea(
                        'Angular',
                        1000
                    );

                const plan =
                    await createPlan(
                        'Plano 1.5',
                        1.5
                    );

                const weekStart =
                    await currentWeekStart();

                const fixture =
                    await createWeekFixture(
                        String(
                            area.id
                        ),
                        String(
                            plan.id
                        ),
                        weekStart,
                        1500
                    );

                const byId =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}`
                    );

                expect(
                    byId.status
                ).toBe(200);

                expect(
                    byId.body
                ).toMatchObject({
                    id:
                        fixture.studyAreaWeekId,
                    weekStartDate:
                        weekStart,
                    studyAreaId:
                        String(
                            area.id
                        ),
                    studyPlanId:
                        String(
                            plan.id
                        )
                });

                const byAreaAndWeek =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/area/${area.id}/week/${weekStart}`
                    );

                expect(
                    byAreaAndWeek.status
                ).toBe(200);

                expect(
                    byAreaAndWeek.body.id
                ).toBe(
                    fixture.studyAreaWeekId
                );

                const byWeek =
                    await request<CreatedEntity[]>(
                        `/api/study-area-weeks/week/${weekStart}`
                    );

                expect(
                    byWeek.status
                ).toBe(200);

                expect(
                    byWeek.body
                ).toHaveLength(1);
            }
        );

        it(
            'deve executar o fluxo completo StudyRecord -> WeeklyAssessment via HTTP',
            async () => {
                const area =
                    await createArea(
                        'Angular',
                        1000
                    );

                const plan =
                    await createPlan(
                        'Plano 1.5',
                        1.5
                    );

                const weekStart =
                    await currentWeekStart();

                const fixture =
                    await createWeekFixture(
                        String(
                            area.id
                        ),
                        String(
                            plan.id
                        ),
                        weekStart,
                        1500
                    );

                const first =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records`,
                        {
                            method:
                                'POST',
                            body:
                                JSON.stringify({
                                    date:
                                        weekStart,
                                    minutes:
                                        30
                                })
                        }
                    );

                expect(
                    first.status
                ).toBe(201);

                expect(
                    first.body
                ).toMatchObject({
                    date:
                        weekStart,
                    minutes:
                        30,
                    studyAreaWeekId:
                        fixture.studyAreaWeekId
                });

                const second =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records`,
                        {
                            method:
                                'POST',
                            body:
                                JSON.stringify({
                                    date:
                                        weekStart,
                                    minutes:
                                        45
                                })
                        }
                    );

                expect(
                    second.status
                ).toBe(201);

                const records =
                    await request<CreatedEntity[]>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records`
                    );

                expect(
                    records.status
                ).toBe(200);

                expect(
                    records.body
                ).toHaveLength(2);

                expect(
                    records.body.map(
                        record =>
                            record.minutes
                    )
                ).toEqual([
                    30,
                    45
                ]);

                const assessment =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/assessment`
                    );

                expect(
                    assessment.status
                ).toBe(200);

                expect(
                    assessment.body
                ).toMatchObject({
                    studyAreaWeekId:
                        fixture.studyAreaWeekId,
                    weekGoal:
                        1500,
                    minutesStudied:
                        75,
                    goalAchieved:
                        false
                });

                const persisted =
                    await databasePool.query<{
                        minutes_studied: number;
                        goal_achieved: boolean;
                    }>(
                        `
                        SELECT
                            minutes_studied,
                            goal_achieved
                        FROM weekly_assessment
                        WHERE study_area_week_id = $1
                        `,
                        [
                            fixture.studyAreaWeekId
                        ]
                    );

                expect(
                    persisted.rows[0]
                ).toEqual({
                    minutes_studied:
                        75,
                    goal_achieved:
                        false
                });
            }
        );

        it(
            'deve remover o último StudyRecord por LIFO e recalcular WeeklyAssessment via HTTP',
            async () => {
                const area =
                    await createArea(
                        'Angular',
                        1000
                    );

                const plan =
                    await createPlan(
                        'Plano 1.5',
                        1.5
                    );

                const weekStart =
                    await currentWeekStart();

                const fixture =
                    await createWeekFixture(
                        String(
                            area.id
                        ),
                        String(
                            plan.id
                        ),
                        weekStart,
                        1500
                    );

                await request(
                    `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records`,
                    {
                        method:
                            'POST',
                        body:
                            JSON.stringify({
                                date:
                                    weekStart,
                                minutes:
                                    30
                            })
                    }
                );

                await request(
                    `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records`,
                    {
                        method:
                            'POST',
                        body:
                            JSON.stringify({
                                date:
                                    weekStart,
                                minutes:
                                    45
                            })
                    }
                );

                const remove =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records/last`,
                        {
                            method:
                                'DELETE'
                        }
                    );

                expect(
                    remove.status
                ).toBe(200);

                expect(
                    remove.body
                ).toMatchObject({
                    minutes:
                        45
                });

                const records =
                    await request<CreatedEntity[]>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records`
                    );

                expect(
                    records.body
                ).toHaveLength(1);

                expect(
                    records.body[0]
                ).toMatchObject({
                    minutes:
                        30
                });

                const assessment =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/assessment`
                    );

                expect(
                    assessment.body
                ).toMatchObject({
                    minutesStudied:
                        30,
                    goalAchieved:
                        false,
                    weekGoal:
                        1500
                });
            }
        );

        it(
            'deve rejeitar minutos inválidos no POST de StudyRecord',
            async () => {
                const response =
                    await request<ApiError>(
                        '/api/study-area-weeks/550e8400-e29b-41d4-a716-446655440000/study-records',
                        {
                            method:
                                'POST',
                            body:
                                JSON.stringify({
                                    date:
                                        '2026-08-17',
                                    minutes:
                                        0
                                })
                        }
                    );

                expect(
                    response.status
                ).toBe(422);

                expect(
                    response.body.error.code
                ).toBe(
                    'VALIDATION_ERROR'
                );

                expect(
                    response.body.error.issues
                ).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            field:
                                'minutes'
                        })
                    ])
                );
            }
        );

        it(
            'deve impedir exclusão de StudyRecord pertencente à semana anterior',
            async () => {
                const area =
                    await createArea(
                        'Angular',
                        1000
                    );

                const plan =
                    await createPlan(
                        'Plano 1.5',
                        1.5
                    );

                const previousWeek =
                    await previousWeekStart();

                const fixture =
                    await createWeekFixture(
                        String(
                            area.id
                        ),
                        String(
                            plan.id
                        ),
                        previousWeek,
                        1500
                    );

                await databasePool.query(
                    `
                    INSERT INTO study_record (
                        date,
                        minutes,
                        study_area_week_id
                    )
                    VALUES (
                        $1,
                        $2,
                        $3
                    )
                    `,
                    [
                        previousWeek,
                        60,
                        fixture.studyAreaWeekId
                    ]
                );

                const response =
                    await request<ApiError>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/study-records/last`,
                        {
                            method:
                                'DELETE'
                        }
                    );

                expect(
                    response.status
                ).toBe(409);

                expect(
                    response.body.error.code
                ).toBe(
                    'STUDY_RECORD_WEEK_CONFLICT'
                );

                const persisted =
                    await databasePool.query<{
                        count: string;
                    }>(
                        `
                        SELECT
                            COUNT(*)::text AS count
                        FROM study_record
                        WHERE study_area_week_id = $1
                        `,
                        [
                            fixture.studyAreaWeekId
                        ]
                    );

                expect(
                    persisted.rows[0]?.count
                ).toBe('1');
            }
        );

        it(
            'deve disponibilizar WeeklyAssessment somente para leitura',
            async () => {
                const area =
                    await createArea(
                        'Angular',
                        1000
                    );

                const plan =
                    await createPlan(
                        'Plano 1.5',
                        1.5
                    );

                const weekStart =
                    await currentWeekStart();

                const fixture =
                    await createWeekFixture(
                        String(
                            area.id
                        ),
                        String(
                            plan.id
                        ),
                        weekStart,
                        1500
                    );

                const getResponse =
                    await request<CreatedEntity>(
                        `/api/study-area-weeks/${fixture.studyAreaWeekId}/assessment`
                    );

                expect(
                    getResponse.status
                ).toBe(200);

                expect(
                    getResponse.body
                ).toMatchObject({
                    id:
                        fixture.assessmentId,
                    studyAreaWeekId:
                        fixture.studyAreaWeekId,
                    weekGoal:
                        1500,
                    minutesStudied:
                        0,
                    goalAchieved:
                        false
                });

                const postResponse =
                    await request(
                        '/api/weekly-assessments',
                        {
                            method:
                                'POST',
                            body:
                                JSON.stringify({
                                    studyAreaWeekId:
                                        fixture.studyAreaWeekId,
                                    weekGoal:
                                        9999,
                                    minutesStudied:
                                        9999,
                                    goalAchieved:
                                        true
                                })
                        }
                    );

                expect(
                    postResponse.status
                ).toBe(404);

                const putResponse =
                    await request(
                        `/api/weekly-assessments/${fixture.assessmentId}`,
                        {
                            method:
                                'PUT',
                            body:
                                JSON.stringify({
                                    weekGoal:
                                        9999
                                })
                        }
                    );

                expect(
                    putResponse.status
                ).toBe(404);

                const patchResponse =
                    await request(
                        `/api/weekly-assessments/${fixture.assessmentId}`,
                        {
                            method:
                                'PATCH',
                            body:
                                JSON.stringify({
                                    weekGoal:
                                        9999
                                })
                        }
                    );

                expect(
                    patchResponse.status
                ).toBe(404);

                const persisted =
                    await databasePool.query<{
                        week_goal: number;
                        minutes_studied: number;
                        goal_achieved: boolean;
                    }>(
                        `
                        SELECT
                            week_goal,
                            minutes_studied,
                            goal_achieved
                        FROM weekly_assessment
                        WHERE id = $1
                        `,
                        [
                            fixture.assessmentId
                        ]
                    );

                expect(
                    persisted.rows[0]
                ).toEqual({
                    week_goal:
                        1500,
                    minutes_studied:
                        0,
                    goal_achieved:
                        false
                });
            }
        );
    }
);