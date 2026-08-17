import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudyPlanController } from '../../../controllers/study-plan.controller.js';
import { createStudyPlanRouter } from '../../../routes/study-plan.routes.js';
import { httpRequest, startTestServer, type TestServer } from './route-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('StudyPlan routes', () => {
    let testServer: TestServer;

    afterEach(async () => {
        if (testServer) {
            await testServer.close();
        }
    });

    function createController(): StudyPlanController {
        return {
            getAll: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route: 'getAll'
                        });
                }
            ),

            getActive: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route: 'getActive'
                        });
                }
            ),

            getById: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route: 'getById'
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
        } as unknown as StudyPlanController;
    }

    it('deve direcionar GET / para getAll', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyPlanRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route: 'getAll'
            });

        expect(
            controller.getAll
        ).toHaveBeenCalledTimes(1);
    });

    it('deve direcionar GET /active para getActive', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyPlanRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/active`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route: 'getActive'
            });

        expect(
            controller.getActive
        ).toHaveBeenCalledTimes(1);

        expect(
            controller.getById
        ).not.toHaveBeenCalled();
    });

    it('deve validar UUID antes de getById', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyPlanRouter(
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

    it('deve direcionar GET /:id para getById', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyPlanRouter(
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

    it('deve validar POST antes de create', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyPlanRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/`,
                'POST',
                {
                    name: '',
                    coefficient: 0,
                    status: 'invalid'
                }
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.create
        ).not.toHaveBeenCalled();
    });

    it('deve direcionar POST válido para create', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyPlanRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/`,
                'POST',
                {
                    name: 'Plano padrão',
                    coefficient: 1.5,
                    status: 'active'
                }
            );

        expect(result.status)
            .toBe(201);

        expect(
            controller.create
        ).toHaveBeenCalledTimes(1);
    });
});