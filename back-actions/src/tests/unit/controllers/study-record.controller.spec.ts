import {
    describe,
    expect,
    it,
    vi
} from 'vitest';

import {
    StudyRecordController
} from '../../../controllers/study-record.controller.js';

import {
    EntityNotFoundError
} from '../../../services/errors/entity-not-found.error.js';

import {
    createMockRequest,
    createMockResponse
} from '../helpers/request-test.helpers.js';

describe('StudyRecordController', () => {
    it('deve buscar registro pelo id', async () => {
        const record = {
            id: 'record-1',
            date: '2026-08-17',
            minutes: 30,
            studyAreaWeekId: 'week-1'
        };

        const service = {
            findById: vi.fn().mockResolvedValue(
                record
            )
        };

        const controller =
            new StudyRecordController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.getById(
            createMockRequest({
                id: 'record-1'
            }),
            response
        );

        expect(
            service.findById
        ).toHaveBeenCalledWith(
            'record-1'
        );

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(record);
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
                vi.fn().mockResolvedValue(
                    records
                )
        };

        const controller =
            new StudyRecordController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.getByStudyAreaWeek(
            createMockRequest({
                studyAreaWeekId: 'week-1'
            }),
            response
        );

        expect(
            service.findByStudyAreaWeekId
        ).toHaveBeenCalledWith(
            'week-1'
        );

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(records);
    });

    it('deve criar registro com status 201', async () => {
        const record = {
            id: 'record-1',
            date: '2026-08-17',
            minutes: 60,
            studyAreaWeekId: 'week-1'
        };

        const service = {
            create: vi.fn().mockResolvedValue(
                record
            )
        };

        const controller =
            new StudyRecordController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

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
            response
        );

        expect(
            service.create
        ).toHaveBeenCalledWith({
            date: '2026-08-17',
            minutes: 60,
            studyAreaWeekId: 'week-1'
        });

        expect(status)
            .toHaveBeenCalledWith(201);

        expect(json)
            .toHaveBeenCalledWith(record);
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
                vi.fn().mockResolvedValue(
                    record
                )
        };

        const controller =
            new StudyRecordController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.removeLatest(
            createMockRequest({
                studyAreaWeekId: 'week-1'
            }),
            response
        );

        expect(
            service.removeLatest
        ).toHaveBeenCalledWith(
            'week-1'
        );

        expect(status)
            .toHaveBeenCalledWith(200);

        expect(json)
            .toHaveBeenCalledWith(record);
    });

    it('deve encaminhar EntityNotFoundError como 404', async () => {
        const error =
            new EntityNotFoundError(
                'StudyAreaWeek',
                'week-1'
            );

        const service = {
            removeLatest:
                vi.fn().mockRejectedValue(
                    error
                )
        };

        const controller =
            new StudyRecordController(
                service as never
            );

        const {
            response,
            status,
            json
        } = createMockResponse();

        await controller.removeLatest(
            createMockRequest({
                studyAreaWeekId: 'week-1'
            }),
            response
        );

        expect(status)
            .toHaveBeenCalledWith(404);

        expect(json)
            .toHaveBeenCalledWith({
                error: {
                    code:
                        'ENTITY_NOT_FOUND',
                    message:
                        error.message,
                    entity:
                        error.entity,
                    id:
                        error.id
                }
            });
    });
});