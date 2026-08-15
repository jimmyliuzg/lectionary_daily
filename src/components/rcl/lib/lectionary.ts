// Dynamically loaded lectionary data cache
const lectionaryCache = new Map<'A' | 'B' | 'C', LectionaryData>();

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
 * Liturgical year date ranges for RCL cycle
 * Year A: 2025-11-30 to 2026-11-28 (First Sunday of Advent to Christ the King)
 * Year B: 2026-11-29 to 2027-11-26
 * Year C: 2027-11-27 to 2028-12-02
 * Pattern: Years since 0 AD mod 3 determines cycle (A=1, B=2, C=0)
 */
export function getRCLYear(date: Date = new Date()): 'A' | 'B' | 'C' {
    const year = date.getFullYear();
    const christmas = new Date(year, 11, 25);

    // First Sunday of Advent is 4 Sundays before Christmas
    // It's always 3-4 weeks before Christmas (Nov 27 - Dec 3)
    const christmasDay = christmas.getDay() || 7; // Sunday = 7
    const adventStart = new Date(year, 11, 25 - christmasDay - 21);

    // If we're past Advent start, we're in the next liturgical year
    const liturgicalYear = (date >= adventStart) ? year + 1 : year;

    // A, B, C rotate based on liturgical year
    // 2026 % 3 = 1 = Year A
    // 2027 % 3 = 2 = Year B
    // 2028 % 3 = 0 = Year C
    const cycle = ['C', 'A', 'B'] as const;
    return cycle[liturgicalYear % 3];
}

/**
 * Load lectionary data for a specific RCL year
 * Data is cached after first load
 */
async function loadLectionaryYear(rclYear: 'A' | 'B' | 'C'): Promise<LectionaryData> {
    if (lectionaryCache.has(rclYear)) {
        return lectionaryCache.get(rclYear)!;
    }

    try {
        const yearLower = rclYear.toLowerCase();
        const data = await import(`../../../data/lectionary-year-${yearLower}.json`);
        lectionaryCache.set(rclYear, data.default);
        return data.default;
    } catch (error) {
        console.error(`Failed to load lectionary data for Year ${rclYear}:`, error);
        throw new Error(`Lectionary data for Year ${rclYear} not found`);
    }
}

export type LiturgicalSeason =
    | 'advent' | 'christmas' | 'epiphany' | 'lent'
    | 'holy-week' | 'easter' | 'pentecost' | 'ordinary';

export interface LiturgicalInfo {
    season: LiturgicalSeason;
    label: string;
    color: string;
}

const SEASON_INFO: Record<LiturgicalSeason, { label: string; color: string }> = {
    advent: { label: 'Advent', color: '#7a5c9e' },
    christmas: { label: 'Christmas', color: '#c9a227' },
    epiphany: { label: 'Epiphany', color: '#4a8f5c' },
    lent: { label: 'Lent', color: '#7a5c9e' },
    'holy-week': { label: 'Holy Week', color: '#b0413e' },
    easter: { label: 'Easter', color: '#c9a227' },
    pentecost: { label: 'Pentecost', color: '#b0413e' },
    ordinary: { label: 'Ordinary Time', color: '#4a8f5c' },
};

function startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

/** Easter Sunday (Gregorian calendar) via the Anonymous Gregorian algorithm. */
export function easterDate(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

/** First Sunday of Advent: the Sunday 22-28 days before Christmas. */
export function adventStartDate(year: number): Date {
    const christmas = new Date(year, 11, 25);
    const christmasDay = christmas.getDay() || 7;
    return new Date(year, 11, 25 - christmasDay - 21);
}

/** Baptism of the Lord: the first Sunday on or after Jan 7. */
export function baptismDate(year: number): Date {
    const jan7 = new Date(year, 0, 7);
    const dow = jan7.getDay(); // 0 = Sunday
    return addDays(jan7, dow === 0 ? 0 : 7 - dow);
}

/**
 * Determine the liturgical season for a date, with a display label and a
 * liturgical color. Correct for all seasons (uses real Easter computus).
 */
export function getLiturgicalInfo(date: Date = new Date()): LiturgicalInfo {
    const d = startOfDay(date);
    const y = d.getFullYear();

    const easter = easterDate(y);
    const ashWednesday = addDays(easter, -46);
    const palmSunday = addDays(easter, -7);
    const pentecost = addDays(easter, 49);
    const trinity = addDays(easter, 56);

    let season: LiturgicalSeason;
    if (d >= new Date(y, 11, 25)) {
        season = 'christmas';
    } else if (d >= adventStartDate(y)) {
        season = 'advent';
    } else if (d < baptismDate(y)) {
        season = 'christmas';
    } else if (d < ashWednesday) {
        season = 'epiphany';
    } else if (d < palmSunday) {
        season = 'lent';
    } else if (d < easter) {
        season = 'holy-week';
    } else if (d < pentecost) {
        season = 'easter';
    } else if (d < trinity) {
        season = 'pentecost';
    } else {
        season = 'ordinary';
    }

    return { season, ...SEASON_INFO[season] };
}

/**
 * Get the liturgical season name for a given date.
 */
export function getLiturgicalSeason(date: Date = new Date()): string {
    return getLiturgicalInfo(date).label;
}

/**
 * Get readings for a specific date
 */
export async function getReadingsForDate(date: Date): Promise<DayReading | null> {
    const dateStr = formatDateKey(date);
    const rclYear = getRCLYear(date);
    const data = await loadLectionaryYear(rclYear);
    return data.readings.find(r => r.date === dateStr) || null;
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


