import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import type { StudyAreaController } from '../../../controllers/study-area.controller.js';
import type { StudyPlanController } from '../../../controllers/study-plan.controller.js';
import type { StudyAreaWeekController } from '../../../controllers/study-area-week.controller.js';
import type { StudyRecordController } from '../../../controllers/study-record.controller.js';
import type { WeeklyAssessmentController } from '../../../controllers/weekly-assessment.controller.js';
import type { ApiRouteControllers } from '../../../routes/api.routes.js';
import { createApiRouter } from '../../../routes/api.routes.js';
import { httpRequest, startTestServer, type TestServer } from './route-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

type AsyncControllerMethod =
    (
        ...args: any[]
    ) => Promise<void>;

function createControllerHandler<
    THandler extends AsyncControllerMethod
>(
    status: number,
    body: unknown
): THandler {
    const handler = vi.fn(
        async (
            ...args: Parameters<THandler>
        ): Promise<void> => {
            const response =
                args[1] as Response;

            response
                .status(status)
                .json(body);
        }
    );

    return handler as unknown as THandler;
}

function createDeleteHandler<
    THandler extends AsyncControllerMethod
>(
    status: number
): THandler {
    const handler = vi.fn(
        async (
            ...args: Parameters<THandler>
        ): Promise<void> => {
            const response =
                args[1] as Response;

            response
                .status(status)
                .send();
        }
    );

    return handler as unknown as THandler;
}

describe('API routes', () => {
    let testServer: TestServer;

    afterEach(async () => {
        if (testServer) {
            await testServer.close();
        }
    });

    function createControllers(): ApiRouteControllers {
        const studyAreaController =
            {
                getAll:
                    createControllerHandler<
                        StudyAreaController['getAll']
                    >(
                        200,
                        {
                            route:
                                'study-area'
                        }
                    ),

                getById:
                    createControllerHandler<
                        StudyAreaController['getById']
                    >(
                        200,
                        {
                            route:
                                'study-area'
                        }
                    ),

                create:
                    createControllerHandler<
                        StudyAreaController['create']
                    >(
                        201,
                        {
                            route:
                                'study-area'
                        }
                    ),

                update:
                    createControllerHandler<
                        StudyAreaController['update']
                    >(
                        200,
                        {
                            route:
                                'study-area'
                        }
                    ),

                delete:
                    createDeleteHandler<
                        StudyAreaController['delete']
                    >(204)
            } satisfies Pick<
                StudyAreaController,
                | 'getAll'
                | 'getById'
                | 'create'
                | 'update'
                | 'delete'
            >;

        const studyPlanController =
            {
                getAll:
                    createControllerHandler<
                        StudyPlanController['getAll']
                    >(
                        200,
                        {
                            route:
                                'study-plan'
                        }
                    ),

                getActive:
                    createControllerHandler<
                        StudyPlanController['getActive']
                    >(
                        200,
                        {
                            route:
                                'study-plan'
                        }
                    ),

                getById:
                    createControllerHandler<
                        StudyPlanController['getById']
                    >(
                        200,
                        {
                            route:
                                'study-plan'
                        }
                    ),

                create:
                    createControllerHandler<
                        StudyPlanController['create']
                    >(
                        201,
                        {
                            route:
                                'study-plan'
                        }
                    )
            } satisfies Pick<
                StudyPlanController,
                | 'getAll'
                | 'getActive'
                | 'getById'
                | 'create'
            >;

        const studyAreaWeekController =
            {
                getByAreaAndWeek:
                    createControllerHandler<
                        StudyAreaWeekController[
                        'getByAreaAndWeek'
                        ]
                    >(
                        200,
                        {
                            route:
                                'study-area-week'
                        }
                    ),

                getByWeekStartDate:
                    createControllerHandler<
                        StudyAreaWeekController[
                        'getByWeekStartDate'
                        ]
                    >(
                        200,
                        {
                            route:
                                'study-area-week'
                        }
                    ),

                getById:
                    createControllerHandler<
                        StudyAreaWeekController[
                        'getById'
                        ]
                    >(
                        200,
                        {
                            route:
                                'study-area-week'
                        }
                    ),

                create:
                    createControllerHandler<
                        StudyAreaWeekController[
                        'create'
                        ]
                    >(
                        201,
                        {
                            route:
                                'study-area-week'
                        }
                    )
            } satisfies Pick<
                StudyAreaWeekController,
                | 'getByAreaAndWeek'
                | 'getByWeekStartDate'
                | 'getById'
                | 'create'
            >;

        const studyRecordController =
            {
                getById:
                    createControllerHandler<
                        StudyRecordController[
                        'getById'
                        ]
                    >(
                        200,
                        {
                            route:
                                'study-record'
                        }
                    ),

                getByStudyAreaWeek:
                    createControllerHandler<
                        StudyRecordController[
                        'getByStudyAreaWeek'
                        ]
                    >(
                        200,
                        {
                            route:
                                'study-record'
                        }
                    ),

                create:
                    createControllerHandler<
                        StudyRecordController[
                        'create'
                        ]
                    >(
                        201,
                        {
                            route:
                                'study-record'
                        }
                    ),

                removeLatest:
                    createControllerHandler<
                        StudyRecordController[
                        'removeLatest'
                        ]
                    >(
                        200,
                        {
                            route:
                                'study-record'
                        }
                    )
            } satisfies Pick<
                StudyRecordController,
                | 'getById'
                | 'getByStudyAreaWeek'
                | 'create'
                | 'removeLatest'
            >;

        const weeklyAssessmentController =
            {
                getByStudyAreaWeek:
                    createControllerHandler<
                        WeeklyAssessmentController[
                        'getByStudyAreaWeek'
                        ]
                    >(
                        200,
                        {
                            route:
                                'weekly-assessment'
                        }
                    )
            } satisfies Pick<
                WeeklyAssessmentController,
                'getByStudyAreaWeek'
            >;

        return {
            studyAreaController:
                studyAreaController as StudyAreaController,

            studyPlanController:
                studyPlanController as StudyPlanController,

            studyAreaWeekController:
                studyAreaWeekController as StudyAreaWeekController,

            studyRecordController:
                studyRecordController as StudyRecordController,

            weeklyAssessmentController:
                weeklyAssessmentController as WeeklyAssessmentController
        };
    }

    it('deve montar /study-areas', async () => {
        const controllers =
            createControllers();

        testServer =
            await startTestServer(
                createApiRouter(
                    controllers
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-areas/`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'study-area'
            });
    });

    it('deve montar /study-plans', async () => {
        const controllers =
            createControllers();

        testServer =
            await startTestServer(
                createApiRouter(
                    controllers
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-plans/`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'study-plan'
            });
    });

    it('deve montar /study-area-weeks', async () => {
        const controllers =
            createControllers();

        testServer =
            await startTestServer(
                createApiRouter(
                    controllers
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/week/2026-08-17`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'study-area-week'
            });
    });

    it('deve montar StudyRecord sob a raiz da API', async () => {
        const controllers =
            createControllers();

        testServer =
            await startTestServer(
                createApiRouter(
                    controllers
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-records/${VALID_UUID}`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'study-record'
            });
    });

    it('deve montar WeeklyAssessment sob a raiz da API', async () => {
        const controllers =
            createControllers();

        testServer =
            await startTestServer(
                createApiRouter(
                    controllers
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/${VALID_UUID}/assessment`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'weekly-assessment'
            });
    });
});