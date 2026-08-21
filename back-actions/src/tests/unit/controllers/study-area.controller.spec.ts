import { describe, expect, it, vi } from 'vitest';
import { StudyAreaController } from '../../../controllers/study-area.controller.js';
import { EntityNotFoundError } from '../../../services/errors/entity-not-found.error.js';
import { createMockRequest, createMockResponse } from '../helpers/request-test.helpers.js';

describe('StudyAreaController', () => {
    it('deve retornar todas as áreas com status 200', async () => {
        const areas = [
            {
                id: 'area-1',
                name: 'Angular',
                weeklyGoalMinutes: 600
            }
        ];

        const service = {
            findAll: vi.fn().mockResolvedValue(areas)
        };

        const controller = new StudyAreaController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();
        await controller.getAll(createMockRequest(), response, next);

        expect(service.findAll).toHaveBeenCalledTimes(1);
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(areas);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve buscar uma área pelo id', async () => {
        const area = {
            id: 'area-1',
            name: 'Angular',
            weeklyGoalMinutes: 600
        };

        const service = {
            findById: vi.fn().mockResolvedValue(area)
        };

        const controller = new StudyAreaController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getById(
            createMockRequest({
                id: 'area-1'
            }),
            response,
            next
        );

        expect(service.findById).toHaveBeenCalledWith('area-1');
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(area);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve criar uma área com status 201', async () => {
        const area = {
            id: 'area-1',
            name: 'Angular',
            weeklyGoalMinutes: 600
        };

        const service = {
            create: vi.fn().mockResolvedValue(area)
        };

        const controller = new StudyAreaController(service as never);

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
                    name: 'Angular',
                    weeklyGoalMinutes: 600
                }
            ),
            response,
            next
        );

        expect(service.create).toHaveBeenCalledWith({
            name: 'Angular',
            weeklyGoalMinutes: 600
        });

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith(area);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve atualizar uma área com status 200', async () => {
        const area = {
            id: 'area-1',
            name: 'Angular Avançado',
            weeklyGoalMinutes: 900
        };

        const service = {
            update: vi.fn().mockResolvedValue(area)
        };

        const controller = new StudyAreaController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.update(
            createMockRequest(
                {
                    id: 'area-1'
                },
                {
                    name: 'Angular Avançado',
                    weeklyGoalMinutes: 900
                }
            ),
            response,
            next
        );

        expect(service.update).toHaveBeenCalledWith(
            'area-1',
            {
                name: 'Angular Avançado',
                weeklyGoalMinutes: 900
            }
        );

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(area);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve excluir uma área com status 204', async () => {
        const service = {
            delete: vi.fn().mockResolvedValue(undefined)
        };

        const controller = new StudyAreaController(service as never);

        const {
            response,
            status,
            send
        } = createMockResponse();

        const next = vi.fn();

        await controller.delete(
            createMockRequest({
                id: 'area-1'
            }),
            response,
            next
        );

        expect(service.delete).toHaveBeenCalledWith('area-1');
        expect(status).toHaveBeenCalledWith(204);
        expect(send).toHaveBeenCalledTimes(1);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar EntityNotFoundError para o middleware global', async () => {
        const error = new EntityNotFoundError(
            'StudyArea',
            'area-1'
        );

        const service = {
            findById: vi.fn().mockRejectedValue(error)
        };

        const controller = new StudyAreaController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getById(
            createMockRequest({
                id: 'area-1'
            }),
            response,
            next
        );

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
        expect(status).not.toHaveBeenCalled();
        expect(json).not.toHaveBeenCalled();
    });
});