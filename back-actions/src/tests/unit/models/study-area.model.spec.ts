import { describe, expect, expectTypeOf, it } from 'vitest';
import type { StudyArea } from '../../../models/study-area.model.js';

describe('StudyArea model', () => {
    it('deve possuir o contrato de tipos esperado', () => {
        expectTypeOf<StudyArea>().toEqualTypeOf<{
            id: string;
            name: string;
            weeklyGoalMinutes: number;
        }>();
    });

    it('deve representar corretamente uma área de estudo', () => {
        const studyArea = {
            id: 'area-1',
            name: 'Angular',
            weeklyGoalMinutes: 600
        } satisfies StudyArea;

        expect(studyArea.id).toBe('area-1');
        expect(studyArea.name).toBe('Angular');
        expect(studyArea.weeklyGoalMinutes)
            .toBe(600);
    });

    it('deve utilizar number para weeklyGoalMinutes', () => {
        expectTypeOf<
            StudyArea['weeklyGoalMinutes']
        >().toEqualTypeOf<number>();
    });

    it('deve utilizar string para name', () => {
        expectTypeOf<StudyArea['name']>()
            .toEqualTypeOf<string>();
    });
});