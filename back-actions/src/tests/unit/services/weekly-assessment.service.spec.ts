import { describe, expect, it, vi } from 'vitest';

import type { StudyAreaWeekRepository } from '../../../repositories/study-area-week.repository.js';
import type { WeeklyAssessmentRepository } from '../../../repositories/weekly-assessment.repository.js';
import { WeeklyAssessmentService } from '../../../services/weekly-assessment.service.js';

function createAssessmentRepositoryMock(): WeeklyAssessmentRepository {
    return {
        findByStudyAreaWeekId: vi.fn()
    } as unknown as WeeklyAssessmentRepository;
}

function createStudyAreaWeekRepositoryMock(): StudyAreaWeekRepository {
    return {
        findById: vi.fn()
    } as unknown as StudyAreaWeekRepository;
}

describe('WeeklyAssessmentService', () => {
    describe('findByStudyAreaWeekId', () => {
        it('deve rejeitar quando a StudyAreaWeek não existir', async () => {
            const repository = createAssessmentRepositoryMock();
            const studyAreaWeekRepository =
                createStudyAreaWeekRepositoryMock();

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue(null);

            const service = new WeeklyAssessmentService(
                repository,
                studyAreaWeekRepository
            );

            await expect(
                service.findByStudyAreaWeekId('week-1')
            ).rejects.toThrowError(
                'StudyAreaWeek with id "week-1" was not found.'
            );

            expect(
                repository.findByStudyAreaWeekId
            ).not.toHaveBeenCalled();
        });

        it('deve rejeitar quando a avaliação não existir', async () => {
            const repository = createAssessmentRepositoryMock();
            const studyAreaWeekRepository =
                createStudyAreaWeekRepositoryMock();

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue({} as Awaited<
                ReturnType<StudyAreaWeekRepository['findById']>
            >);

            vi.mocked(
                repository.findByStudyAreaWeekId
            ).mockResolvedValue(null);

            const service = new WeeklyAssessmentService(
                repository,
                studyAreaWeekRepository
            );

            await expect(
                service.findByStudyAreaWeekId('week-1')
            ).rejects.toThrowError(
                'WeeklyAssessment with id "week-1" was not found.'
            );
        });

        it('deve retornar a avaliação existente', async () => {
            const repository = createAssessmentRepositoryMock();
            const studyAreaWeekRepository =
                createStudyAreaWeekRepositoryMock();

            const assessment = {
                id: 'assessment-1',
                studyAreaWeekId: 'week-1',
                weekGoal: 1500,
                minutesStudied: 900,
                goalAchieved: false
            } as Awaited<
                ReturnType<WeeklyAssessmentRepository['findByStudyAreaWeekId']>
            >;

            vi.mocked(
                studyAreaWeekRepository.findById
            ).mockResolvedValue({} as Awaited<
                ReturnType<StudyAreaWeekRepository['findById']>
            >);

            vi.mocked(
                repository.findByStudyAreaWeekId
            ).mockResolvedValue(assessment);

            const service = new WeeklyAssessmentService(
                repository,
                studyAreaWeekRepository
            );

            await expect(
                service.findByStudyAreaWeekId('week-1')
            ).resolves.toBe(assessment);
        });
    });
});