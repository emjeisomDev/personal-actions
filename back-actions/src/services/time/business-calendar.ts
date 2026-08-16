const TIME_ZONE = 'America/Sao_Paulo';

interface BusinessDateParts {
    year: number;
    month: number;
    day: number;
    weekday: number;
}

function getDateParts(
    date: Date
): BusinessDateParts {
    const formatter =
        new Intl.DateTimeFormat(
            'en-US',
            {
                timeZone: TIME_ZONE,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                weekday: 'short'
            }
        );

    const parts = formatter.formatToParts(date);

    const get =
        (type: string): string =>
            parts.find(
                (part) =>
                    part.type === type
            )?.value ?? '';

    const weekdayName = get('weekday');

    const weekdayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6
    };

    return {
        year: Number(get('year')),
        month: Number(get('month')),
        day: Number(get('day')),
        weekday: weekdayMap[weekdayName]
    };
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

function toIsoDate(year: number, month: number, day: number): string {
    return `${year}-${pad(month)}-${pad(day)}`;
}

export function getCurrentBusinessDate(now: Date = new Date()): string {
    const parts = getDateParts(now);
    return toIsoDate(
        parts.year,
        parts.month,
        parts.day
    );
}

export function isBusinessMonday(now: Date = new Date()): boolean {
    return getDateParts(now).weekday === 1;
}

export function getCurrentWeekStartDate(now: Date = new Date()): string {
    const parts = getDateParts(now);

    const currentDate =
        new Date(
            Date.UTC(
                parts.year,
                parts.month - 1,
                parts.day
            )
        );

    const daysFromMonday = (parts.weekday + 6) % 7;

    currentDate.setUTCDate(currentDate.getUTCDate() - daysFromMonday);

    return toIsoDate(
        currentDate.getUTCFullYear(),
        currentDate.getUTCMonth() + 1,
        currentDate.getUTCDate()
    );
}

export const BUSINESS_TIME_ZONE = TIME_ZONE;