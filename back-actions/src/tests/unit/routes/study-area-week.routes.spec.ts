import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudyAreaWeekController } from '../../../controllers/study-area-week.controller.js';
import { createStudyAreaWeekRouter } from '../../../routes/study-area-week.routes.js';
import { httpRequest, startTestServer, type TestServer } from './route-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('StudyAreaWeek routes', () => {
    let testServer: TestServer;

    afterEach(async () => {
        if (testServer) {
            await testServer.close();
        }
    });

    function createController(): StudyAreaWeekController {
        return {
            getByAreaAndWeek: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route:
                                'getByAreaAndWeek'
                        });
                }
            ),

            getByWeekStartDate: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route:
                                'getByWeekStartDate'
                        });
                }
            ),

            getById: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route:
                                'getById'
                        });
                }
            ),

            create: vi.fn(
                (_request, response) => {
                    response
                        .status(201)
                        .json({
                            route: 'create'
                        });
                }
            )
        } as unknown as StudyAreaWeekController;
    }

    it('deve direcionar consulta por área e semana', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/area/${VALID_UUID}/week/2026-08-17`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'getByAreaAndWeek'
            });

        expect(
            controller.getByAreaAndWeek
        ).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar UUID inválido na consulta por área', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/area/invalid/week/2026-08-17`,
                'GET'
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.getByAreaAndWeek
        ).not.toHaveBeenCalled();
    });

    it('deve rejeitar data inválida na consulta por área', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/area/${VALID_UUID}/week/2026-02-30`,
                'GET'
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.getByAreaAndWeek
        ).not.toHaveBeenCalled();
    });

    it('deve direcionar consulta por semana', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/week/2026-08-17`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'getByWeekStartDate'
            });

        expect(
            controller.getByWeekStartDate
        ).toHaveBeenCalledTimes(1);
    });

    it('deve direcionar consulta por id', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/${VALID_UUID}`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route: 'getById'
            });

        expect(
            controller.getById
        ).toHaveBeenCalledTimes(1);
    });

    it('deve validar UUID antes de getById', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/invalid`,
                'GET'
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.getById
        ).not.toHaveBeenCalled();
    });

    it('deve direcionar POST válido para create', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/`,
                'POST',
                {
                    studyAreaId:
                        VALID_UUID,
                    studyPlanId:
                        VALID_UUID,
                    weekStartDate:
                        '2026-08-17'
                }
            );

        expect(result.status)
            .toBe(201);

        expect(
            controller.create
        ).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar POST inválido antes de create', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaWeekRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/`,
                'POST',
                {
                    studyAreaId: 'invalid',
                    studyPlanId: 'invalid',
                    weekStartDate:
                        '2026-02-30'
                }
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.create
        ).not.toHaveBeenCalled();
    });
});