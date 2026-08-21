import { describe, expect, it, vi } from 'vitest';
import { WeeklyAssessmentController } from '../../../controllers/weekly-assessment.controller.js';
import { EntityNotFoundError } from '../../../services/errors/entity-not-found.error.js';
import { createMockRequest, createMockResponse } from '../helpers/request-test.helpers.js';

describe('WeeklyAssessmentController', () => {
    it('deve retornar avaliação por StudyAreaWeek com status 200', async () => {
        const assessment = {
            id: 'assessment-1',
            studyAreaWeekId: 'week-1',
            weekGoal: 900,
            minutesStudied: 600,
            goalAchieved: false
        };

        const service = {
            findByStudyAreaWeekId:
                vi.fn().mockResolvedValue(assessment)
        };

        const controller = new WeeklyAssessmentController(service as never);

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

        expect(service.findByStudyAreaWeekId).toHaveBeenCalledWith('week-1');

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith(assessment);
        expect(next).not.toHaveBeenCalled();
    });

    it('deve encaminhar EntityNotFoundError para o middleware global', async () => {
        const error =
            new EntityNotFoundError(
                'WeeklyAssessment',
                'week-1'
            );

        const service = {
            findByStudyAreaWeekId: vi.fn().mockRejectedValue(error)
        };

        const controller = new WeeklyAssessmentController(service as never);

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

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(error);
        expect(status).not.toHaveBeenCalled();
        expect(json).not.toHaveBeenCalled();
    });
});