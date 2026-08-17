import { afterEach, describe, expect, it, vi } from 'vitest';
import type { StudyRecordController } from '../../../controllers/study-record.controller.js';
import { createStudyRecordRouter } from '../../../routes/study-record.routes.js';
import { httpRequest, startTestServer, type TestServer } from './route-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('StudyRecord routes', () => {
    let testServer: TestServer;

    afterEach(async () => {
        if (testServer) {
            await testServer.close();
        }
    });

    function createController(): StudyRecordController {
        return {
            getById: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route: 'getById'
                        });
                }
            ),

            getByStudyAreaWeek: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route:
                                'getByStudyAreaWeek'
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

            removeLatest: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route:
                                'removeLatest'
                        });
                }
            )
        } as unknown as StudyRecordController;
    }

    it('deve direcionar GET /study-records/:id', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
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
                route: 'getById'
            });

        expect(
            controller.getById
        ).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar id inválido antes de getById', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-records/invalid`,
                'GET'
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.getById
        ).not.toHaveBeenCalled();
    });

    it('deve direcionar GET por StudyAreaWeek', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/${VALID_UUID}/study-records`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'getByStudyAreaWeek'
            });

        expect(
            controller.getByStudyAreaWeek
        ).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar StudyAreaWeek inválida na consulta de registros', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/invalid/study-records`,
                'GET'
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.getByStudyAreaWeek
        ).not.toHaveBeenCalled();
    });

    it('deve direcionar POST válido para create', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/${VALID_UUID}/study-records`,
                'POST',
                {
                    date:
                        '2026-08-17',
                    minutes:
                        60
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

    it('deve impedir POST com minutes inválido', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/${VALID_UUID}/study-records`,
                'POST',
                {
                    date:
                        '2026-08-17',
                    minutes:
                        0
                }
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.create
        ).not.toHaveBeenCalled();
    });

    it('deve direcionar DELETE /last para removeLatest', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/${VALID_UUID}/study-records/last`,
                'DELETE'
            );

        expect(result.status)
            .toBe(200);

        expect(result.body)
            .toEqual({
                route:
                    'removeLatest'
            });

        expect(
            controller.removeLatest
        ).toHaveBeenCalledTimes(1);
    });

    it('deve rejeitar StudyAreaWeek inválida antes de removeLatest', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createStudyRecordRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/invalid/study-records/last`,
                'DELETE'
            );

        expect(result.status)
            .toBe(422);

        expect(
            controller.removeLatest
        ).not.toHaveBeenCalled();
    });
});