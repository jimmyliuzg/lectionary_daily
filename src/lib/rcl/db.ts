import { openDB, type IDBPDatabase } from 'idb';

export interface Verse {
    uvid: number;
    ref: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface ScriptureBlock {
    type: 'paragraph' | 'heading' | 'poetry';
    text: string;
    verse?: number;
    indent?: number;
}

export interface Book {
    id: string;
    name: string;
    testament: string;
    chapters: number;
}

export interface RangeSpec {
    chapter: number;
    endChapter: number;
    startVerse?: number;
    endVerse?: number;
}

export interface ParsedReferenceLike {
    bookId: string;
    ranges: RangeSpec[];
}

const DB_NAME = 'rcl-bible-db';
const DB_VERSION = 3; // v3: chunked hydration + typed range queries

export async function initDB(): Promise<IDBPDatabase> {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('verses')) {
                const verseStore = db.createObjectStore('verses', { keyPath: 'uvid' });
                verseStore.createIndex('ref', 'ref', { unique: true });
                verseStore.createIndex('book_chapter', ['book', 'chapter']);
            }

            if (!db.objectStoreNames.contains('books')) {
                db.createObjectStore('books', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('chapters')) {
                db.createObjectStore('chapters', { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains('metadata')) {
                db.createObjectStore('metadata');
            }
        },
    });
}

export async function isHydrated(): Promise<boolean> {
    const db = await initDB();
    const status = await db.get('metadata', 'hydrationStatus');
    return status === 'complete';
}

// Guard against concurrent hydration (e.g. React StrictMode double effects).
let hydrating: Promise<void> | null = null;

const CHUNK_SIZE = 2500;

/**
 * Hydrate the Bible into IndexedDB in chunks so the main thread / transaction
 * budget is never blocked by one giant transaction. Idempotent.
 */
export async function hydrateBible(data: { verses: Verse[], books: Book[] }, structuredData?: any): Promise<void> {
    if (hydrating) return hydrating;
    hydrating = (async () => {
        const db = await initDB();

        console.log('Starting Bible hydration into IndexedDB...');

        // Clear existing data first
        const clearTx = db.transaction(['verses', 'books', 'chapters'], 'readwrite');
        await Promise.all([
            clearTx.objectStore('verses').clear(),
            clearTx.objectStore('books').clear(),
            clearTx.objectStore('chapters').clear(),
        ]);
        await clearTx.done;

        // Batch-insert verses in chunks (separate transactions)
        for (let i = 0; i < data.verses.length; i += CHUNK_SIZE) {
            const chunk = data.verses.slice(i, i + CHUNK_SIZE);
            const tx = db.transaction('verses', 'readwrite');
            for (const verse of chunk) {
                tx.objectStore('verses').put(verse);
            }
            await tx.done;
        }

        // Books (small)
        const booksTx = db.transaction('books', 'readwrite');
        for (const book of data.books) {
            booksTx.objectStore('books').put(book);
        }
        await booksTx.done;

        // Structured chapters (small-ish)
        if (structuredData) {
            const chapterTx = db.transaction('chapters', 'readwrite');
            const chapterStore = chapterTx.objectStore('chapters');
            for (const [bookId, chapters] of Object.entries(structuredData)) {
                for (const [chapterNum, blocks] of Object.entries(chapters as any)) {
                    chapterStore.put({
                        id: `${bookId}_${chapterNum}`,
                        bookId,
                        chapterNum: parseInt(chapterNum, 10),
                        blocks,
                    });
                }
            }
            await chapterTx.done;
        }

        await db.put('metadata', 'complete', 'hydrationStatus');
        console.log('Bible hydration complete!');
    })();
    try {
        return await hydrating;
    } finally {
        hydrating = null;
    }
}

export async function getVersesForChapter(chapterRef: string): Promise<Verse[]> {
    const db = await initDB();
    // chapterRef format: "GEN.1" — verses are stored with ref "GEN.1.N"
    const range = IDBKeyRange.bound(`${chapterRef}.`, `${chapterRef}.\uffff`);
    return db.getAllFromIndex('verses', 'ref', range);
}

export async function getStructuredChapter(bookId: string, chapterNum: number): Promise<ScriptureBlock[] | null> {
    const db = await initDB();
    const chapter = await db.get('chapters', `${bookId}_${chapterNum}`);
    return chapter ? chapter.blocks : null;
}

/**
 * Fetch structured blocks for a parsed reference (which may span several
 * chapter/verse ranges). Headings are included once, only when a verse inside
 * the reading follows them.
 */
export async function getBlocksByParsedReference(parsed: ParsedReferenceLike): Promise<ScriptureBlock[] | null> {
    const all: ScriptureBlock[] = [];
    const seenHeadings = new Set<string>();

    for (const range of parsed.ranges) {
        const blocks = await getBlocksForRange(parsed.bookId, range, seenHeadings);
        if (blocks) all.push(...blocks);
    }

    return all.length > 0 ? all : null;
}

async function getBlocksForRange(bookId: string, range: RangeSpec, seenHeadings: Set<string>): Promise<ScriptureBlock[] | null> {
    const out: ScriptureBlock[] = [];
    let any = false;

    for (let c = range.chapter; c <= range.endChapter; c++) {
        const blocks = await getStructuredChapter(bookId, c);
        if (!blocks) continue;

        let lastHeading: ScriptureBlock | null = null;
        for (const block of blocks) {
            if (block.type === 'heading') {
                lastHeading = block;
                continue;
            }

            const v = block.verse || 0;
            let include = true;

            if (c === range.chapter && range.startVerse !== undefined) {
                // Include blocks that start before the range only when they
                // visibly extend into it (paragraphs carry inline verse numbers).
                if (v < range.startVerse && !blockTextHasVerse(block.text, range.startVerse)) {
                    include = false;
                }
            }
            if (c === range.endChapter && range.endVerse !== undefined && v > range.endVerse) {
                include = false;
            }

            if (include) {
                any = true;
                if (lastHeading && !seenHeadings.has(lastHeading.text)) {
                    seenHeadings.add(lastHeading.text);
                    out.push(lastHeading);
                }
                lastHeading = null;
                out.push(block);
            }
        }
    }

    return any ? out : null;
}

// Does a structured block's text contain an inline verse marker for verse v?
// Structured paragraphs render inline numbers as " 2<nnbsp>" etc.
function blockTextHasVerse(text: string, v: number): boolean {
    return new RegExp(`(^|\\s)${v}\\u202f`).test(text);
}

/**
 * Fetch individual verses for a parsed reference (fallback when structured
 * blocks are unavailable).
 */
export async function getVersesByParsedReference(parsed: ParsedReferenceLike): Promise<Verse[]> {
    const all: Verse[] = [];

    for (const range of parsed.ranges) {
        for (let c = range.chapter; c <= range.endChapter; c++) {
            const chapterVerses = await getVersesForChapter(`${parsed.bookId}.${c}`);

            const filtered = chapterVerses.filter((v) => {
                if (c === range.chapter && range.startVerse !== undefined && v.verse < range.startVerse) return false;
                if (c === range.endChapter && range.endVerse !== undefined && v.verse > range.endVerse) return false;
                return true;
            });

            all.push(...filtered);
        }
    }

    return all;
}
