import { describe, it, expect } from 'vitest';
import { parseReference } from '../src/components/rcl/lib/references';
import { getRCLYear, getLiturgicalInfo, easterDate } from '../src/components/rcl/lib/lectionary';

describe('parseReference', () => {
    it('parses a simple chapter:verse', () => {
        const p = parseReference('John 3:16');
        expect(p).not.toBeNull();
        expect(p!.bookId).toBe('JHN');
        expect(p!.ranges).toEqual([{ chapter: 3, endChapter: 3, startVerse: 16, endVerse: 16 }]);
    });

    it('parses a whole chapter', () => {
        const p = parseReference('Psalm 100');
        expect(p!.ranges).toEqual([{ chapter: 100, endChapter: 100 }]);
    });

    it('parses a single-chapter book verse range (Jude 17-25)', () => {
        const p = parseReference('Jude 17-25');
        expect(p!.bookId).toBe('JUD');
        expect(p!.ranges).toEqual([{ chapter: 1, endChapter: 1, startVerse: 17, endVerse: 25 }]);
    });

    it('parses a multi-chapter range (Genesis 1-2)', () => {
        const p = parseReference('Genesis 1-2');
        expect(p!.ranges).toEqual([{ chapter: 1, endChapter: 2 }]);
    });

    it('parses non-contiguous verses (Ezekiel 34:11-16, 20-24)', () => {
        const p = parseReference('Ezekiel 34:11-16, 20-24');
        expect(p!.ranges).toEqual([
            { chapter: 34, endChapter: 34, startVerse: 11, endVerse: 16 },
            { chapter: 34, endChapter: 34, startVerse: 20, endVerse: 24 },
        ]);
    });

    it('parses three ranges (Nehemiah 8:1-3, 5-6, 8-10)', () => {
        const p = parseReference('Nehemiah 8:1-3, 5-6, 8-10');
        expect(p!.ranges).toHaveLength(3);
    });

    it('parses parenthesised ranges (John 1:(1-9), 10-18)', () => {
        const p = parseReference('John 1:(1-9), 10-18');
        expect(p!.ranges).toEqual([
            { chapter: 1, endChapter: 1, startVerse: 1, endVerse: 9 },
            { chapter: 1, endChapter: 1, startVerse: 10, endVerse: 18 },
        ]);
    });

    it('parses book-inherited continuation (Exodus 14:10-31; 15:20-21)', () => {
        const p = parseReference('Exodus 14:10-31; 15:20-21');
        expect(p!.ranges).toEqual([
            { chapter: 14, endChapter: 14, startVerse: 10, endVerse: 31 },
            { chapter: 15, endChapter: 15, startVerse: 20, endVerse: 21 },
        ]);
    });

    it('parses lettered verses (John 13:1-17, 31b-35)', () => {
        const p = parseReference('John 13:1-17, 31b-35');
        expect(p!.ranges).toEqual([
            { chapter: 13, endChapter: 13, startVerse: 1, endVerse: 17 },
            { chapter: 13, endChapter: 13, startVerse: 31, endVerse: 35 },
        ]);
    });

    it('parses cross-chapter ranges (1 Samuel 3:10-4:1)', () => {
        const p = parseReference('1 Samuel 3:10-4:1');
        expect(p!.ranges).toEqual([{ chapter: 3, endChapter: 4, startVerse: 10, endVerse: 1 }]);
    });

    it('parses number-prefixed books (1 Corinthians 13:1-13)', () => {
        const p = parseReference('1 Corinthians 13:1-13');
        expect(p!.bookId).toBe('1CO');
    });

    it('parses Song of Solomon', () => {
        const p = parseReference('Song of Solomon 2:8-13');
        expect(p!.bookId).toBe('SNG');
    });

    it('parses "and" psalms (Psalm 42 and 43)', () => {
        const p = parseReference('Psalm 42 and 43');
        expect(p!.ranges).toEqual([
            { chapter: 42, endChapter: 42 },
            { chapter: 43, endChapter: 43 },
        ]);
    });

    it('returns null for junk', () => {
        expect(parseReference('not a reference')).toBeNull();
        expect(parseReference('')).toBeNull();
    });
});

describe('getRCLYear', () => {
    it('maps Advent through Christ the King', () => {
        expect(getRCLYear(new Date(2025, 10, 30))).toBe('A'); // Advent 1, 2025
        expect(getRCLYear(new Date(2026, 10, 22))).toBe('A'); // Christ the King, 2026
        expect(getRCLYear(new Date(2026, 10, 29))).toBe('B'); // Advent 1, 2026
        expect(getRCLYear(new Date(2027, 10, 28))).toBe('C'); // Advent 1, 2027
    });

    it('maps the season after Christ the King to the previous year', () => {
        expect(getRCLYear(new Date(2026, 10, 25))).toBe('A'); // before Advent 1 B
        expect(getRCLYear(new Date(2025, 10, 27))).toBe('C');
    });
});

describe('liturgical calendar', () => {
    it('computes Easter correctly', () => {
        expect(easterDate(2026)).toEqual(new Date(2026, 3, 5));
        expect(easterDate(2027)).toEqual(new Date(2027, 2, 28));
        expect(easterDate(2028)).toEqual(new Date(2028, 3, 16));
        expect(easterDate(2000)).toEqual(new Date(2000, 3, 23));
        expect(easterDate(2038)).toEqual(new Date(2038, 3, 25));
    });

    it('detects Advent', () => {
        expect(getLiturgicalInfo(new Date(2026, 10, 30)).season).toBe('advent');
        expect(getLiturgicalInfo(new Date(2026, 11, 24)).season).toBe('advent');
    });

    it('detects Christmas (Dec 25 through Baptism of the Lord)', () => {
        expect(getLiturgicalInfo(new Date(2026, 11, 25)).season).toBe('christmas');
        expect(getLiturgicalInfo(new Date(2027, 0, 1)).season).toBe('christmas');
        expect(getLiturgicalInfo(new Date(2027, 0, 9)).season).toBe('christmas'); // day before Baptism
        expect(getLiturgicalInfo(new Date(2027, 0, 10)).season).toBe('epiphany'); // Baptism of the Lord
    });

    it('detects Epiphany, Lent, Holy Week, Easter, Pentecost, Ordinary', () => {
        expect(getLiturgicalInfo(new Date(2026, 1, 8)).season).toBe('epiphany');
        expect(getLiturgicalInfo(new Date(2026, 1, 18)).season).toBe('lent'); // Ash Wednesday 2026 = Feb 18
        expect(getLiturgicalInfo(new Date(2026, 2, 30)).season).toBe('holy-week'); // Palm Sunday = Mar 29
        expect(getLiturgicalInfo(new Date(2026, 3, 5)).season).toBe('easter');
        expect(getLiturgicalInfo(new Date(2026, 4, 24)).season).toBe('pentecost'); // Pentecost = May 24
        expect(getLiturgicalInfo(new Date(2026, 6, 4)).season).toBe('ordinary');
    });

    it('assigns liturgical colors', () => {
        expect(getLiturgicalInfo(new Date(2026, 10, 30)).color).toMatch(/^#/);
        expect(getLiturgicalInfo(new Date(2026, 2, 30)).season).toBe('holy-week');
    });
});
