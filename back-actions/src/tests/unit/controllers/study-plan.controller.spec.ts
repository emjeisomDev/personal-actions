import { describe, expect, it, vi } from 'vitest';
import { StudyPlanController } from '../../../controllers/study-plan.controller.js';
import { ValidationError } from '../../../services/errors/validation.error.js';
import { createMockRequest, createMockResponse } from '../helpers/request-test.helpers.js';

describe('StudyPlanController', () => {
    it('deve retornar todos os planos com status 200', async () => {
        const plans = [
            {
                id: 'plan-1',
                name: 'Plano padrão',
                coefficient: 1,
                status: 'active'
            }
        ];

        const service = {
            findAll: vi.fn().mockResolvedValue(
                plans
            )
        };

        const controller =
            new StudyPlanController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.getAll(
            createMockRequest(),
            response
        );

        expect(
            service.findAll
        ).toHaveBeenCalledTimes(1);

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(plans);
    });

    it('deve retornar somente planos ativos', async () => {
        const plans = [
            {
                id: 'plan-1',
                name: 'Plano ativo',
                coefficient: 1,
                status: 'active'
            }
        ];

        const service = {
            findActive: vi.fn().mockResolvedValue(
                plans
            )
        };

        const controller =
            new StudyPlanController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.getActive(
            createMockRequest(),
            response
        );

        expect(
            service.findActive
        ).toHaveBeenCalledTimes(1);

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(plans);
    });

    it('deve buscar plano pelo id', async () => {
        const plan = {
            id: 'plan-1',
            name: 'Plano padrão',
            coefficient: 1,
            status: 'active'
        };

        const service = {
            findById: vi.fn().mockResolvedValue(
                plan
            )
        };

        const controller =
            new StudyPlanController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.getById(
            createMockRequest({
                id: 'plan-1'
            }),
            response
        );

        expect(
            service.findById
        ).toHaveBeenCalledWith(
            'plan-1'
        );

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(plan);
    });

    it('deve criar plano com status 201', async () => {
        const plan = {
            id: 'plan-1',
            name: 'Plano padrão',
            coefficient: 1.5,
            status: 'active'
        };

        const service = {
            create: vi.fn().mockResolvedValue(
                plan
            )
        };

        const controller =
            new StudyPlanController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.create(
            createMockRequest(
                {},
                {
                    name: 'Plano padrão',
                    coefficient: 1.5,
                    status: 'active'
                }
            ),
            response
        );

        expect(
            service.create
        ).toHaveBeenCalledWith({
            name: 'Plano padrão',
            coefficient: 1.5,
            status: 'active'
        });

        expect(status)
            .toHaveBeenCalledWith(201);

        expect(json)
            .toHaveBeenCalledWith(plan);
    });

    it('deve encaminhar ValidationError como 422', async () => {
        const error =
            new ValidationError(
                'Invalid coefficient.',
                'INVALID_COEFFICIENT'
            );

        const service = {
            create: vi.fn().mockRejectedValue(
                error
            )
        };

        const controller =
            new StudyPlanController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.create(
            createMockRequest(
                {},
                {
                    name: 'Plano',
                    coefficient: 0,
                    status: 'active'
                }
            ),
            response
        );

        expect(status)
            .toHaveBeenCalledWith(422);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code: 'INVALID_COEFFICIENT',
                    message:
                        'Invalid coefficient.'
                }
            });
    });
});