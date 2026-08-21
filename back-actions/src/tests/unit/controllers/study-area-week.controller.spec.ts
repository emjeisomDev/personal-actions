import { describe, expect, it, vi } from 'vitest';
import { StudyAreaWeekController } from '../../../controllers/study-area-week.controller.js';
import { BusinessRuleError } from '../../../services/errors/business-rule.error.js';
import { EntityNotFoundError } from '../../../services/errors/entity-not-found.error.js';
import { createMockRequest, createMockResponse } from '../helpers/request-test.helpers.js';

describe('StudyAreaWeekController', () => {
    it('deve buscar configuração pelo id', async () => {
        const configuration = {
            id: 'week-1',
            weekStartDate: '2026-08-17',
            studyAreaId: 'area-1',
            studyPlanId: 'plan-1'
        };

        const service = {
            findById: vi.fn().mockResolvedValue(configuration)
        };

        const controller = new StudyAreaWeekController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getById(
            createMockRequest({
                id: 'week-1'
            }),
            response,
            next
        );

        expect(service.findById).toHaveBeenCalledWith('week-1');
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(configuration);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve buscar configuração por área e semana', async () => {
        const configuration = {
            id: 'week-1',
            weekStartDate: '2026-08-17',
            studyAreaId: 'area-1',
            studyPlanId: 'plan-1'
        };

        const service = {
            findByAreaAndWeek: vi.fn().mockResolvedValue(configuration)
        };

        const controller = new StudyAreaWeekController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getByAreaAndWeek(
            createMockRequest({
                studyAreaId: 'area-1',
                weekStartDate: '2026-08-17'
            }),
            response,
            next
        );

        expect(service.findByAreaAndWeek).toHaveBeenCalledWith(
            'area-1',
            '2026-08-17'
        );

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(configuration);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar EntityNotFoundError quando não existir configuração por área e semana', async () => {
        const service = {
            findByAreaAndWeek: vi.fn().mockResolvedValue(null)
        };

        const controller = new StudyAreaWeekController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getByAreaAndWeek(
            createMockRequest({
                studyAreaId: 'area-1',
                weekStartDate: '2026-08-17'
            }),
            response,
            next
        );

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'EntityNotFoundError',
                entity: 'StudyAreaWeek',
                id: 'area-1:2026-08-17'
            })
        );

        expect(status).not.toHaveBeenCalled();
        expect(json).not.toHaveBeenCalled();
    });

    it('deve buscar configurações pela semana', async () => {
        const configurations = [
            {
                id: 'week-1',
                weekStartDate: '2026-08-17',
                studyAreaId: 'area-1',
                studyPlanId: 'plan-1'
            }
        ];

        const service = {
            findByWeekStartDate: vi.fn().mockResolvedValue(configurations)
        };

        const controller = new StudyAreaWeekController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getByWeekStartDate(
            createMockRequest({
                weekStartDate: '2026-08-17'
            }),
            response,
            next
        );

        expect(service.findByWeekStartDate).toHaveBeenCalledWith(
            '2026-08-17'
        );

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(configurations);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve criar configuração semanal com status 201', async () => {
        const result = {
            studyAreaWeek: {
                id: 'week-1',
                weekStartDate: '2026-08-17',
                studyAreaId: 'area-1',
                studyPlanId: 'plan-1'
            },
            assessment: {
                id: 'assessment-1',
                studyAreaWeekId: 'week-1',
                weekGoal: 900,
                minutesStudied: 0,
                goalAchieved: false
            }
        };

        const service = {
            create: vi.fn().mockResolvedValue(result)
        };

        const controller = new StudyAreaWeekController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.create(
            createMockRequest(
                {},
                {
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1',
                    weekStartDate: '2026-08-17'
                }
            ),
            response,
            next
        );

        expect(service.create).toHaveBeenCalledWith({
            studyAreaId: 'area-1',
            studyPlanId: 'plan-1',
            weekStartDate: '2026-08-17'
        });

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith(result);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar BusinessRuleError para o middleware global', async () => {
        const error = new BusinessRuleError(
            'Weekly configuration can only be changed on Monday.',
            'WEEK_CONFIGURATION_ONLY_ON_MONDAY',
            409
        );

        const service = {
            create: vi.fn().mockRejectedValue(error)
        };

        const controller = new StudyAreaWeekController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.create(
            createMockRequest(
                {},
                {
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1',
                    weekStartDate: '2026-08-17'
                }
            ),
            response,
            next
        );

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
        expect(status).not.toHaveBeenCalled();
        expect(json).not.toHaveBeenCalled();
    });
});