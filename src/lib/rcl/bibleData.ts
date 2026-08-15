import type { Book, Verse } from './db';

export interface BibleData {
    verses: Verse[];
    books: Book[];
}

export type StructuredData = Record<string, Record<string, unknown>>;

let biblePromise: Promise<BibleData> | null = null;
let structuredPromise: Promise<StructuredData> | null = null;

/**
 * Lazily load the full Bible JSON (bundled as a separate chunk so the initial
 * payload stays small). Cached after the first load.
 */
export function loadBibleData(): Promise<BibleData> {
    biblePromise ??= import('../../data/bible-bsb.json').then((m) => m.default as BibleData);
    return biblePromise;
}

export function loadStructuredData(): Promise<StructuredData> {
    structuredPromise ??= import('../../data/bible-structured.json').then((m) => m.default as StructuredData);
    return structuredPromise;
}
