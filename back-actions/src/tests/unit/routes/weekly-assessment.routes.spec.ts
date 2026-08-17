import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WeeklyAssessmentController } from '../../../controllers/weekly-assessment.controller.js';
import { createWeeklyAssessmentRouter } from '../../../routes/weekly-assessment.routes.js';
import { httpRequest, startTestServer, type TestServer } from './route-test.helpers.js';

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000';

describe('WeeklyAssessment routes', () => {
    let testServer: TestServer;

    afterEach(async () => {
        if (testServer) {
            await testServer.close();
        }
    });

    function createController(): WeeklyAssessmentController {
        return {
            getByStudyAreaWeek: vi.fn(
                (_request, response) => {
                    response
                        .status(200)
                        .json({
                            route:
                                'getByStudyAreaWeek'
                        });
                }
            )
        } as unknown as WeeklyAssessmentController;
    }

    it('deve direcionar GET para getByStudyAreaWeek', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createWeeklyAssessmentRouter(
                    controller
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
                    'getByStudyAreaWeek'
            });

        expect(
            controller.getByStudyAreaWeek
        ).toHaveBeenCalledTimes(1);
    });

    it('atualmente encaminha UUID inválido ao Controller', async () => {
        const controller =
            createController();

        testServer =
            await startTestServer(
                createWeeklyAssessmentRouter(
                    controller
                )
            );

        const result =
            await httpRequest(
                `${testServer.url}/study-area-weeks/invalid/assessment`,
                'GET'
            );

        expect(result.status)
            .toBe(200);

        expect(
            controller.getByStudyAreaWeek
        ).toHaveBeenCalledTimes(1);
    });
});