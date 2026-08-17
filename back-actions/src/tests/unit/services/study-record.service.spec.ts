import { describe, expect, it, vi } from 'vitest';

import type { Pool } from 'pg';

import type { StudyAreaWeekRepository } from '../../../repositories/study-area-week.repository.js';
import type { StudyRecordRepository } from '../../../repositories/study-record.repository.js';
import type { WeeklyAssessmentRepository } from '../../../repositories/weekly-assessment.repository.js';

import { StudyRecordService } from '../../../services/study-record.service.js';

function createPoolMock(): Pool {
    return {
        connect: vi.fn()
    } as unknown as Pool;
}

function createStudyAreaWeekRepositoryMock(): StudyAreaWeekRepository {
    return {
        findById: vi.fn()
    } as unknown as StudyAreaWeekRepository;
}

function createStudyRecordRepositoryMock(): StudyRecordRepository {
    return {
        findById: vi.fn(),
        findByStudyAreaWeekId: vi.fn()
    } as unknown as StudyRecordRepository;
}

function createAssessmentRepositoryMock(): WeeklyAssessmentRepository {
    return {
        findByStudyAreaWeekId: vi.fn(),
        update: vi.fn()
    } as unknown as WeeklyAssessmentRepository;
}

function createService(
    nowProvider: () => Date =
        () => new Date(
            '2026-08-17T12:00:00-03:00'
        )
): {
    service: StudyRecordService;
    studyAreaWeekRepository: StudyAreaWeekRepository;
    studyRecordRepository: StudyRecordRepository;
} {
    const studyAreaWeekRepository =
        createStudyAreaWeekRepositoryMock();

    const studyRecordRepository =
        createStudyRecordRepositoryMock();

    const assessmentRepository =
        createAssessmentRepositoryMock();

    const service =
        new StudyRecordService(
            createPoolMock(),
            studyAreaWeekRepository,
            studyRecordRepository,
            assessmentRepository,
            nowProvider
        );

    return {
        service,
        studyAreaWeekRepository,
        studyRecordRepository
    };
}

describe('StudyRecordService', () => {
    describe('create', () => {
        it('deve rejeitar data fora do formato YYYY-MM-DD', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            await expect(
                service.create({
                    date: '17-08-2026',
                    minutes: 30,
                    studyAreaWeekId: 'week-1'
                })
            ).rejects.toThrowError(
                'Date must use YYYY-MM-DD format.'
            );

            expect(
                studyAreaWeekRepository.findById
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar data inexistente', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            await expect(
                service.create({
                    date: '2026-02-30',
                    minutes: 30,
                    studyAreaWeekId: 'week-1'
                })
            ).rejects.toThrowError(
                'Date is invalid.'
            );

            expect(
                studyAreaWeekRepository.findById
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar zero minutos', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            await expect(
                service.create({
                    date: '2026-08-17',
                    minutes: 0,
                    studyAreaWeekId: 'week-1'
                })
            ).rejects.toThrowError(
                'Study record minutes must be a positive integer.'
            );

            expect(
                studyAreaWeekRepository.findById
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar minutos negativos', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            await expect(
                service.create({
                    date: '2026-08-17',
                    minutes: -30,
                    studyAreaWeekId: 'week-1'
                })
            ).rejects.toThrowError(
                'Study record minutes must be a positive integer.'
            );

            expect(
                studyAreaWeekRepository.findById
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar minutos decimais', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            await expect(
                service.create({
                    date: '2026-08-17',
                    minutes: 30.5,
                    studyAreaWeekId: 'week-1'
                })
            ).rejects.toThrowError(
                'Study record minutes must be a positive integer.'
            );

            expect(
                studyAreaWeekRepository.findById
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar StudyAreaWeek inexistente', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue(null);

            await expect(
                service.create({
                    date: '2026-08-17',
                    minutes: 30,
                    studyAreaWeekId: 'week-1'
                })
            ).rejects.toThrowError(
                'StudyAreaWeek with id "week-1" was not found.'
            );
        });
    });

    describe('findById', () => {
        it('deve retornar registro existente', async () => {
            const {
                service,
                studyRecordRepository
            } = createService();

            const record = {
                id: 'record-1',
                studyAreaWeekId: 'week-1',
                date: '2026-08-17',
                minutes: 30
            } as Awaited<
                ReturnType<
                    StudyRecordRepository['findById']
                >
            >;

            vi.mocked(
                studyRecordRepository.findById
            ).mockResolvedValue(
                record
            );

            await expect(
                service.findById('record-1')
            ).resolves.toBe(record);
        });

        it('deve rejeitar registro inexistente', async () => {
            const {
                service,
                studyRecordRepository
            } = createService();

            vi.mocked(
                studyRecordRepository.findById
            ).mockResolvedValue(
                null
            );

            await expect(
                service.findById('record-1')
            ).rejects.toThrowError(
                'StudyRecord with id "record-1" was not found.'
            );
        });
    });

    describe('findByStudyAreaWeekId', () => {
        it('deve rejeitar StudyAreaWeek inexistente', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue(
                null
            );

            await expect(
                service.findByStudyAreaWeekId(
                    'week-1'
                )
            ).rejects.toThrowError(
                'StudyAreaWeek with id "week-1" was not found.'
            );
        });

        it('deve consultar registros quando StudyAreaWeek existir', async () => {
            const {
                service,
                studyAreaWeekRepository,
                studyRecordRepository
            } = createService();

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue(
                {} as Awaited<
                    ReturnType<
                        StudyAreaWeekRepository['findById']
                    >
                >
            );

            const records =
                [] as Awaited<
                    ReturnType<
                        StudyRecordRepository[
                        'findByStudyAreaWeekId'
                        ]
                    >
                >;

            vi.mocked(
                studyRecordRepository
                    .findByStudyAreaWeekId
            ).mockResolvedValue(
                records
            );

            await expect(
                service.findByStudyAreaWeekId(
                    'week-1'
                )
            ).resolves.toBe(
                records
            );
        });
    });

    describe('removeLatest', () => {
        it('deve rejeitar StudyAreaWeek inexistente', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService();

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue(
                null
            );

            await expect(
                service.removeLatest(
                    'week-1'
                )
            ).rejects.toThrowError(
                'StudyAreaWeek with id "week-1" was not found.'
            );
        });

        it('deve rejeitar remoção de semana diferente da semana corrente', async () => {
            const {
                service,
                studyAreaWeekRepository
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue({
                weekStartDate: '2026-08-10'
            } as Awaited<
                ReturnType<
                    StudyAreaWeekRepository['findById']
                >
            >);

            await expect(
                service.removeLatest(
                    'week-1'
                )
            ).rejects.toThrowError(
                'Study records can only be removed from the current week.'
            );
        });
    });
});