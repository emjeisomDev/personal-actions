import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudyAreaController } from '../../../controllers/study-area.controller.js';
import { createStudyAreaRouter } from '../../../routes/study-area.routes.js';
import { httpRequest, startTestServer, type TestServer } from './route-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('StudyArea routes', () => {
    let testServer: TestServer;

    afterEach(async () => {
        if (testServer) {
            await testServer.close();
        }
    });

    function createController(): StudyAreaController {
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
            ),

            update: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route: 'update'
                        });
                }
            ),

            delete: vi.fn(
                (_request, response) => {
                    response
                        .status(204)
                        .send();
                }
            )
        } as unknown as StudyAreaController;
    }

    it('deve direcionar GET / para getAll', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaRouter(
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

    it('deve validar UUID antes de chamar getById', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaRouter(
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
                createStudyAreaRouter(
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

    it('deve validar POST antes de chamar create', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/`,
                'POST',
                {
                    name: '',
                    weeklyGoalMinutes: 0
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
                createStudyAreaRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/`,
                'POST',
                {
                    name: 'Angular',
                    weeklyGoalMinutes: 600
                }
            );

        expect(result.status)
            .toBe(201);

        expect(result.body)
            .toEqual({
                route: 'create'
            });

        expect(
            controller.create
        ).toHaveBeenCalledTimes(1);
    });

    it('deve direcionar PUT válido para update', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/${VALID_UUID}`,
                'PUT',
                {
                    name: 'Angular Avançado',
                    weeklyGoalMinutes: 900
                }
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route: 'update'
            });

        expect(
            controller.update
        ).toHaveBeenCalledTimes(1);
    });

    it('deve validar UUID antes de PUT', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/invalid`,
                'PUT',
                {
                    name: 'Angular',
                    weeklyGoalMinutes: 600
                }
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.update
        ).not.toHaveBeenCalled();
    });

    it('deve direcionar DELETE válido para delete', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyAreaRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/${VALID_UUID}`,
                'DELETE'
            );

        expect(result.status)
            .toBe(204);

        expect(
            controller.delete
        ).toHaveBeenCalledTimes(1);
    });
});