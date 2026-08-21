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

        const service = { findAll: vi.fn().mockResolvedValue(plans) };

        const controller = new StudyPlanController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getAll(
            createMockRequest(),
            response,
            next
        );

        expect(service.findAll).toHaveBeenCalledTimes(1);
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(plans);
        expect(next).not.toHaveBeenCalled();
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
            findActive: vi.fn().mockResolvedValue(plans)
        };

        const controller = new StudyPlanController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getActive(createMockRequest(), response, next);

        expect(service.findActive).toHaveBeenCalledTimes(1);
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(plans);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve buscar plano pelo id', async () => {
        const plan = {
            id: 'plan-1',
            name: 'Plano padrão',
            coefficient: 1,
            status: 'active'
        };

        const service = { findById: vi.fn().mockResolvedValue(plan) };

        const controller = new StudyPlanController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getById(
            createMockRequest({
                id: 'plan-1'
            }),
            response,
            next
        );

        expect(service.findById).toHaveBeenCalledWith('plan-1');
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(plan);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve criar plano com status 201', async () => {
        const plan = {
            id: 'plan-1',
            name: 'Plano padrão',
            coefficient: 1.5,
            status: 'active'
        };

        const service = { create: vi.fn().mockResolvedValue(plan) };

        const controller = new StudyPlanController(service as never);

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
                    name: 'Plano padrão',
                    coefficient: 1.5,
                    status: 'active'
                }
            ),
            response,
            next
        );

        expect(service.create).toHaveBeenCalledWith({
            name: 'Plano padrão',
            coefficient: 1.5,
            status: 'active'
        });

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith(plan);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar ValidationError para o middleware global', async () => {
        const error = new ValidationError(
            'Invalid coefficient.',
            'INVALID_COEFFICIENT'
        );

        const service = {
            create: vi.fn().mockRejectedValue(error)
        };

        const controller = new StudyPlanController(service as never);

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
                    name: 'Plano',
                    coefficient: 0,
                    status: 'active'
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