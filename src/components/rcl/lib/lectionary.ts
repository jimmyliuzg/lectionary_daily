import lectionary2026 from '../../../data/rcl/lectionary-2026.json';

export interface Reading {
    type: string;
    reference: string;
}

export interface DayReading {
    date: string;
    dayName: string;
    isSunday?: boolean;
    readings: Reading[];
}

export interface LectionaryData {
    year: string;
    liturgicalYear: string;
    readings: DayReading[];
}

/**
 * Get the RCL year (A, B, or C) for a given date
 * Year A: liturgical years divisible by 3 with remainder 1 (2023-24, 2026-27)
 * Year B: liturgical years divisible by 3 with remainder 2 
 * Year C: liturgical years divisible by 3 with remainder 0
 */
export function getRCLYear(date: Date = new Date()): 'A' | 'B' | 'C' {
    const year = date.getFullYear();
    const christmas = new Date(year, 11, 25);

    // First Sunday of Advent is 4 Sundays before Christmas
    const christmasDay = christmas.getDay() || 7; // Sunday = 7
    const adventStart = new Date(year, 11, 25 - christmasDay - 21);

    // If we're past Advent start, we're in the next liturgical year
    const liturgicalYear = (date >= adventStart) ? year + 1 : year;

    // A, B, C rotate based on liturgical year
    const cycle = ['C', 'A', 'B'] as const;
    return cycle[liturgicalYear % 3];
}

/**
 * Get the liturgical season for a given date
 */
export function getLiturgicalSeason(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Rough season detection (can be refined)
    // Advent: ~4 weeks before Christmas
    const christmas = new Date(year, 11, 25);
    const christmasDay = christmas.getDay() || 7;
    const adventStart = new Date(year, 11, 25 - christmasDay - 21);

    if (date >= adventStart && date < christmas) return 'Advent';

    // Christmas: Dec 25 - Jan 6
    const epiphany = new Date(year + (month === 11 ? 1 : 0), 0, 6);
    if ((month === 11 && day >= 25) || (month === 0 && day <= 6)) return 'Christmas';

    // Epiphany: Jan 6 until Ash Wednesday
    // Easter calculation (simplified - would need proper algorithm)
    if (month === 0 || month === 1) return 'Epiphany';

    // Lent: Ash Wednesday to Easter
    if (month === 2 || (month === 3 && day < 20)) return 'Lent';

    // Easter: ~7 weeks
    if (month === 3 || (month === 4 && day < 20)) return 'Easter';

    // Pentecost / Ordinary Time
    return 'Ordinary Time';
}

/**
 * Get readings for a specific date
 */
export function getReadingsForDate(date: Date): DayReading | null {
    const dateStr = formatDateKey(date);
    const data = lectionary2026 as LectionaryData;
    return data.readings.find(r => r.date === dateStr) || null;
}

/**
 * Get readings for a range of dates (for week view)
 */
export function getReadingsForRange(startDate: Date, days: number = 7): DayReading[] {
    const readings: DayReading[] = [];

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayReading = getReadingsForDate(date);

        if (dayReading) {
            readings.push(dayReading);
        } else {
            // Create placeholder for missing dates
            readings.push({
                date: formatDateKey(date),
                dayName: formatDisplayDate(date),
                readings: [],
            });
        }
    }

    return readings;
}

/**
 * Format date as YYYY-MM-DD for lookup
 */
export function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Format date for display
 */
export function formatDisplayDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Get the week containing a date (Sunday-Saturday or Monday-Sunday)
 */
export function getWeekDates(date: Date, startOnSunday: boolean = true): Date[] {
    const dates: Date[] = [];
    const current = new Date(date);

    // Find start of week
    const dayOfWeek = current.getDay();
    const startOffset = startOnSunday ? dayOfWeek : (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
    current.setDate(current.getDate() - startOffset);

    for (let i = 0; i < 7; i++) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}
