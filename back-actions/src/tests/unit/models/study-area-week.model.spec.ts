import { describe, expect, expectTypeOf, it } from 'vitest';
import type { StudyAreaWeek } from '../../../models/study-area-week.model.js';

describe('StudyAreaWeek model', () => {
    it('deve possuir o contrato de tipos esperado', () => {
        expectTypeOf<StudyAreaWeek>().toEqualTypeOf<{
            id: string;
            weekStartDate: string;
            studyAreaId: string;
            studyPlanId: string;
        }>();
    });

    it('deve representar corretamente uma configuração semanal', () => {
        const configuration = {
            id: 'week-1',
            weekStartDate: '2026-08-17',
            studyAreaId: 'area-1',
            studyPlanId: 'plan-1'
        } satisfies StudyAreaWeek;

        expect(configuration.id).toBe('week-1');
        expect(configuration.weekStartDate)
            .toBe('2026-08-17');
        expect(configuration.studyAreaId)
            .toBe('area-1');
        expect(configuration.studyPlanId)
            .toBe('plan-1');
    });

    it('deve utilizar string para weekStartDate', () => {
        expectTypeOf<StudyAreaWeek['weekStartDate']>()
            .toEqualTypeOf<string>();
    });

    it('deve representar os relacionamentos através de IDs', () => {
        expectTypeOf<StudyAreaWeek['studyAreaId']>()
            .toEqualTypeOf<string>();

        expectTypeOf<StudyAreaWeek['studyPlanId']>()
            .toEqualTypeOf<string>();
    });
});