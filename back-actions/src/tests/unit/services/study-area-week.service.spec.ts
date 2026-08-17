import { describe, expect, it, vi } from 'vitest';

import type { Pool } from 'pg';

import type { StudyAreaRepository } from '../../../repositories/study-area.repository.js';
import type { StudyAreaWeekRepository } from '../../../repositories/study-area-week.repository.js';
import type { StudyPlanRepository } from '../../../repositories/study-plan.repository.js';
import type { WeeklyAssessmentRepository } from '../../../repositories/weekly-assessment.repository.js';

import { StudyAreaWeekService } from '../../../services/study-area-week.service.js';

function createPoolMock(): Pool {
    return {
        connect: vi.fn()
    } as unknown as Pool;
}

function createRepositoryMock(): StudyAreaWeekRepository {
    return {
        findById: vi.fn(),
        findByAreaAndWeek: vi.fn(),
        findByWeekStartDate: vi.fn()
    } as unknown as StudyAreaWeekRepository;
}

function createStudyAreaRepositoryMock(): StudyAreaRepository {
    return {
        findById: vi.fn()
    } as unknown as StudyAreaRepository;
}

function createStudyPlanRepositoryMock(): StudyPlanRepository {
    return {
        findById: vi.fn()
    } as unknown as StudyPlanRepository;
}

function createAssessmentRepositoryMock(): WeeklyAssessmentRepository {
    return {
        create: vi.fn()
    } as unknown as WeeklyAssessmentRepository;
}

function createService(
    nowProvider: () => Date
): {
    service: StudyAreaWeekService;
    repository: StudyAreaWeekRepository;
} {
    const repository =
        createRepositoryMock();

    const service =
        new StudyAreaWeekService(
            createPoolMock(),
            repository,
            createStudyAreaRepositoryMock(),
            createStudyPlanRepositoryMock(),
            createAssessmentRepositoryMock(),
            nowProvider
        );

    return {
        service,
        repository
    };
}

describe('StudyAreaWeekService', () => {
    describe('create', () => {
        it('deve rejeitar configuração fora da segunda-feira', async () => {
            const {
                service
            } = createService(
                () => new Date(
                    '2026-08-18T12:00:00-03:00'
                )
            );

            await expect(
                service.create({
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1',
                    weekStartDate: '2026-08-17'
                })
            ).rejects.toThrowError(
                'Weekly configuration can only be changed on Monday.'
            );
        });

        it('deve rejeitar data fora do formato YYYY-MM-DD', async () => {
            const {
                service,
                repository
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            await expect(
                service.create({
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1',
                    weekStartDate: '17-08-2026'
                })
            ).rejects.toThrowError(
                'Date must use YYYY-MM-DD format.'
            );

            expect(
                repository.findByAreaAndWeek
            ).not.toHaveBeenCalled();

            expect(
                repository.findByWeekStartDate
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar data que não representa uma data válida', async () => {
            const {
                service,
                repository
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            await expect(
                service.create({
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1',
                    weekStartDate: '2026-02-30'
                })
            ).rejects.toThrowError(
                'Date is invalid.'
            );

            expect(
                repository.findByAreaAndWeek
            ).not.toHaveBeenCalled();

            expect(
                repository.findByWeekStartDate
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar configuração para semana diferente da atual', async () => {
            const {
                service
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            await expect(
                service.create({
                    studyAreaId: 'area-1',
                    studyPlanId: 'plan-1',
                    weekStartDate: '2026-08-10'
                })
            ).rejects.toThrowError(
                'Weekly configuration can only be changed for the current week.'
            );
        });
    });

    describe('findById', () => {
        it('deve retornar StudyAreaWeek existente', async () => {
            const {
                service,
                repository
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            const configuration = {
                id: 'week-1'
            } as Awaited<
                ReturnType<
                    StudyAreaWeekRepository['findById']
                >
            >;

            vi.mocked(
                repository.findById
            ).mockResolvedValue(
                configuration
            );

            await expect(
                service.findById(
                    'week-1'
                )
            ).resolves.toBe(
                configuration
            );
        });

        it('deve rejeitar StudyAreaWeek inexistente', async () => {
            const {
                service,
                repository
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            vi.mocked(
                repository.findById
            ).mockResolvedValue(
                null
            );

            await expect(
                service.findById(
                    'week-1'
                )
            ).rejects.toThrowError(
                'StudyAreaWeek with id "week-1" was not found.'
            );
        });
    });

    describe('findByAreaAndWeek', () => {
        it('deve rejeitar data inválida antes de consultar o repository', async () => {
            const {
                service,
                repository
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            await expect(
                service.findByAreaAndWeek(
                    'area-1',
                    'invalid-date'
                )
            ).rejects.toThrowError(
                'Date must use YYYY-MM-DD format.'
            );

            expect(
                repository.findByAreaAndWeek
            ).not.toHaveBeenCalled();
        });
    });

    describe('findByWeekStartDate', () => {
        it('deve rejeitar data inválida antes de consultar o repository', async () => {
            const {
                service,
                repository
            } = createService(
                () => new Date(
                    '2026-08-17T12:00:00-03:00'
                )
            );

            await expect(
                service.findByWeekStartDate(
                    'invalid-date'
                )
            ).rejects.toThrowError(
                'Date must use YYYY-MM-DD format.'
            );

            expect(
                repository.findByWeekStartDate
            ).not.toHaveBeenCalled();
        });
    });
});