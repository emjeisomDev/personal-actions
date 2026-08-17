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
            findAll: vi.fn().mockResolvedValue(
                areas
            )
        };

        const controller =
            new StudyAreaController(
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
            .toHaveBeenCalledWith(areas);
    });

    it('deve buscar uma área pelo id', async () => {
        const area = {
            id: 'area-1',
            name: 'Angular',
            weeklyGoalMinutes: 600
        };

        const service = {
            findById: vi.fn().mockResolvedValue(
                area
            )
        };

        const controller =
            new StudyAreaController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.getById(
            createMockRequest({
                id: 'area-1'
            }),
            response
        );

        expect(
            service.findById
        ).toHaveBeenCalledWith(
            'area-1'
        );

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(area);
    });

    it('deve criar uma área com status 201', async () => {
        const area = {
            id: 'area-1',
            name: 'Angular',
            weeklyGoalMinutes: 600
        };

        const service = {
            create: vi.fn().mockResolvedValue(
                area
            )
        };

        const controller =
            new StudyAreaController(
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
                    name: 'Angular',
                    weeklyGoalMinutes: 600
                }
            ),
            response
        );

        expect(
            service.create
        ).toHaveBeenCalledWith({
            name: 'Angular',
            weeklyGoalMinutes: 600
        });

        expect(status)
            .toHaveBeenCalledWith(201);

        expect(json)
            .toHaveBeenCalledWith(area);
    });

    it('deve atualizar uma área com status 200', async () => {
        const area = {
            id: 'area-1',
            name: 'Angular Avançado',
            weeklyGoalMinutes: 900
        };

        const service = {
            update: vi.fn().mockResolvedValue(
                area
            )
        };

        const controller =
            new StudyAreaController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

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
            response
        );

        expect(
            service.update
        ).toHaveBeenCalledWith(
            'area-1',
            {
                name: 'Angular Avançado',
                weeklyGoalMinutes: 900
            }
        );

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(area);
    });

    it('deve excluir uma área com status 204', async () => {
        const service = {
            delete: vi.fn().mockResolvedValue(
                undefined
            )
        };

        const controller =
            new StudyAreaController(
                service as never
            );

        const {
            response,
            status,
            send
        } = createMockResponse();

        await controller.delete(
            createMockRequest({
                id: 'area-1'
            }),
            response
        );

        expect(
            service.delete
        ).toHaveBeenCalledWith(
            'area-1'
        );

        expect(status)
            .toHaveBeenCalledWith(204);

        expect(send)
            .toHaveBeenCalledTimes(1);
    });

    it('deve encaminhar erro do Service para sendControllerError', async () => {
        const error =
            new EntityNotFoundError(
                'StudyArea',
                'area-1'
            );

        const service = {
            findById: vi.fn().mockRejectedValue(
                error
            )
        };

        const controller =
            new StudyAreaController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.getById(
            createMockRequest({
                id: 'area-1'
            }),
            response
        );

        expect(status)
            .toHaveBeenCalledWith(404);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code: 'ENTITY_NOT_FOUND',
                    message: error.message,
                    entity: error.entity,
                    id: error.id
                }
            });
    });
});