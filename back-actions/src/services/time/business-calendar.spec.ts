import {
    describe,
    expect,
    it
} from 'vitest';

import {
    getCurrentBusinessDate,
    getCurrentWeekStartDate,
    isBusinessMonday
} from './business-calendar.js';

describe('business-calendar', () => {
    it('should use America/Sao_Paulo to determine the business date', () => {
        const date =
            new Date(
                '2026-08-17T02:30:00.000Z'
            );

        expect(
            getCurrentBusinessDate(date)
        ).toBe('2026-08-16');
    });

    it('should identify Monday', () => {
        const monday =
            new Date(
                '2026-08-17T12:00:00.000Z'
            );

        expect(
            isBusinessMonday(monday)
        ).toBe(true);
    });

    it('should reject Sunday as Monday', () => {
        const sunday =
            new Date(
                '2026-08-16T12:00:00.000Z'
            );

        expect(
            isBusinessMonday(sunday)
        ).toBe(false);
    });

    it('should calculate the Monday of the current week', () => {
        const wednesday =
            new Date(
                '2026-08-19T15:00:00.000Z'
            );

        expect(
            getCurrentWeekStartDate(
                wednesday
            )
        ).toBe('2026-08-17');
    });
});