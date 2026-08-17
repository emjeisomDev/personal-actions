import { describe, expect, expectTypeOf, it } from 'vitest';
import type { WeeklyAssessment } from '../../../models/weekly-assessment.model.js';

describe('WeeklyAssessment model', () => {
    it('deve possuir o contrato de tipos esperado', () => {
        expectTypeOf<WeeklyAssessment>().toEqualTypeOf<{
            id: string;
            studyAreaWeekId: string;
            weekGoal: number;
            minutesStudied: number;
            goalAchieved: boolean;
        }>();
    });

    it('deve representar corretamente uma avaliação semanal', () => {
        const assessment = {
            id: 'assessment-1',
            studyAreaWeekId: 'week-1',
            weekGoal: 900,
            minutesStudied: 600,
            goalAchieved: false
        } satisfies WeeklyAssessment;

        expect(assessment.id)
            .toBe('assessment-1');

        expect(assessment.studyAreaWeekId)
            .toBe('week-1');

        expect(assessment.weekGoal)
            .toBe(900);

        expect(assessment.minutesStudied)
            .toBe(600);

        expect(assessment.goalAchieved)
            .toBe(false);
    });

    it('deve utilizar number para weekGoal', () => {
        expectTypeOf<WeeklyAssessment['weekGoal']>()
            .toEqualTypeOf<number>();
    });

    it('deve utilizar number para minutesStudied', () => {
        expectTypeOf<
            WeeklyAssessment['minutesStudied']
        >().toEqualTypeOf<number>();
    });

    it('deve utilizar boolean para goalAchieved', () => {
        expectTypeOf<
            WeeklyAssessment['goalAchieved']
        >().toEqualTypeOf<boolean>();
    });
});