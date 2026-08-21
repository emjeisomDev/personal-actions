import { describe, expect, it, vi } from 'vitest';
import { StudyRecordController } from '../../../controllers/study-record.controller.js';
import { EntityNotFoundError } from '../../../services/errors/entity-not-found.error.js';
import { createMockRequest, createMockResponse } from '../helpers/request-test.helpers.js';

describe('StudyRecordController', () => {
    it('deve buscar registro pelo id', async () => {
        const record = {
            id: 'record-1',
            date: '2026-08-17',
            minutes: 30,
            studyAreaWeekId: 'week-1'
        };

        const service = {
            findById: vi.fn().mockResolvedValue(record)
        };

        const controller =
            new StudyRecordController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getById(
            createMockRequest({
                id: 'record-1'
            }),
            response,
            next
        );

        expect(service.findById).toHaveBeenCalledWith('record-1');
        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(record);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve buscar registros por StudyAreaWeek', async () => {
        const records = [
            {
                id: 'record-1',
                date: '2026-08-17',
                minutes: 30,
                studyAreaWeekId: 'week-1'
            }
        ];

        const service = {
            findByStudyAreaWeekId:
                vi.fn().mockResolvedValue(records)
        };

        const controller =
            new StudyRecordController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.getByStudyAreaWeek(
            createMockRequest({
                studyAreaWeekId: 'week-1'
            }),
            response,
            next
        );

        expect(service.findByStudyAreaWeekId)
            .toHaveBeenCalledWith('week-1');

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(records);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve criar registro com status 201', async () => {
        const record = {
            id: 'record-1',
            date: '2026-08-17',
            minutes: 60,
            studyAreaWeekId: 'week-1'
        };

        const service = {
            create: vi.fn().mockResolvedValue(record)
        };

        const controller =
            new StudyRecordController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.create(
            createMockRequest(
                {
                    studyAreaWeekId: 'week-1'
                },
                {
                    date: '2026-08-17',
                    minutes: 60
                }
            ),
            response,
            next
        );

        expect(service.create).toHaveBeenCalledWith({
            date: '2026-08-17',
            minutes: 60,
            studyAreaWeekId: 'week-1'
        });

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith(record);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve remover o último registro', async () => {
        const record = {
            id: 'record-2',
            date: '2026-08-17',
            minutes: 30,
            studyAreaWeekId: 'week-1'
        };

        const service = {
            removeLatest:
                vi.fn().mockResolvedValue(record)
        };

        const controller =
            new StudyRecordController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.removeLatest(
            createMockRequest({
                studyAreaWeekId: 'week-1'
            }),
            response,
            next
        );

        expect(service.removeLatest)
            .toHaveBeenCalledWith('week-1');

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(record);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar EntityNotFoundError para o middleware global', async () => {
        const error =
            new EntityNotFoundError(
                'StudyAreaWeek',
                'week-1'
            );

        const service = {
            removeLatest:
                vi.fn().mockRejectedValue(error)
        };

        const controller =
            new StudyRecordController(service as never);

        const {
            response,
            status,
            json
        } = createMockResponse();

        const next = vi.fn();

        await controller.removeLatest(
            createMockRequest({
                studyAreaWeekId: 'week-1'
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