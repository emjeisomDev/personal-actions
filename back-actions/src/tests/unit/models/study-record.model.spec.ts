import { describe, expect, expectTypeOf, it } from 'vitest';
import type { StudyRecord } from '../../../models/study-record.model.js';

describe('StudyRecord model', () => {
    it('deve possuir o contrato de tipos esperado', () => {
        expectTypeOf<StudyRecord>().toEqualTypeOf<{
            id: string;
            date: string;
            minutes: number;
            createdAt: Date;
            studyAreaWeekId: string;
        }>();
    });

    it('deve representar corretamente um StudyRecord', () => {
        const record = {
            id: 'record-1',
            date: '2026-08-17',
            minutes: 30,
            createdAt: new Date(
                '2026-08-17T14:30:00.000Z'
            ),
            studyAreaWeekId: 'week-1'
        } satisfies StudyRecord;

        expect(record.id).toBe('record-1');
        expect(record.date).toBe('2026-08-17');
        expect(record.minutes).toBe(30);
        expect(record.createdAt).toBeInstanceOf(Date);
        expect(record.studyAreaWeekId).toBe('week-1');
    });

    it('deve utilizar Date para createdAt', () => {
        expectTypeOf<StudyRecord['createdAt']>()
            .toEqualTypeOf<Date>();
    });

    it('deve utilizar number para minutes', () => {
        expectTypeOf<StudyRecord['minutes']>()
            .toEqualTypeOf<number>();
    });
});