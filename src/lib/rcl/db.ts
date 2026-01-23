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

const DB_NAME = 'rcl-bible-db';
const DB_VERSION = 2; // Incremented version

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

export async function hydrateBible(data: { verses: Verse[], books: Book[] }, structuredData?: any) {
    const db = await initDB();

    console.log('Starting Bible hydration into IndexedDB...');

    const tx = db.transaction(['verses', 'books', 'chapters', 'metadata'], 'readwrite');
    await tx.objectStore('verses').clear();
    await tx.objectStore('books').clear();
    await tx.objectStore('chapters').clear();

    // Batch insert verses
    const verseStore = tx.objectStore('verses');
    for (const verse of data.verses) {
        verseStore.put(verse);
    }

    // Insert books
    const bookStore = tx.objectStore('books');
    for (const book of data.books) {
        bookStore.put(book);
    }

    // Insert structured chapters
    if (structuredData) {
        const chapterStore = tx.objectStore('chapters');
        for (const [bookId, chapters] of Object.entries(structuredData)) {
            for (const [chapterNum, blocks] of Object.entries(chapters as any)) {
                chapterStore.put({
                    id: `${bookId}_${chapterNum}`,
                    bookId,
                    chapterNum: parseInt(chapterNum),
                    blocks
                });
            }
        }
    }

    await tx.objectStore('metadata').put('complete', 'hydrationStatus');
    await tx.done;

    console.log('Bible hydration complete!');
}

export async function getVersesForChapter(chapterRef: string): Promise<Verse[]> {
    const db = await initDB();
    // chapterRef format: "GEN.1"
    // verses are stored with ref: "GEN.1.1"
    const range = IDBKeyRange.bound(`${chapterRef}.0`, `${chapterRef}.999`);
    return db.getAllFromIndex('verses', 'ref', range);
}

export async function getStructuredChapter(bookId: string, chapterNum: number): Promise<ScriptureBlock[] | null> {
    const db = await initDB();
    const chapter = await db.get('chapters', `${bookId}_${chapterNum}`);
    return chapter ? chapter.blocks : null;
}

export async function getBlocksByParsedReference(parsed: { bookId: string, chapter: number, endChapter?: number, startVerse?: number, endVerse?: number }): Promise<ScriptureBlock[] | null> {
    const startChapter = parsed.chapter;
    const endChapter = parsed.endChapter || startChapter;
    const startVerse = parsed.startVerse;
    const endVerse = parsed.endVerse;

    const allFilteredBlocks: ScriptureBlock[] = [];

    for (let c = startChapter; c <= endChapter; c++) {
        const blocks = await getStructuredChapter(parsed.bookId, c);
        if (!blocks) continue;

        let lastHeading: ScriptureBlock | null = null;
        for (const block of blocks) {
            if (block.type === 'heading') {
                lastHeading = block;
                continue;
            }

            const v = block.verse || 0;
            let include = true;

            // Boundary checks
            if (c === startChapter && startVerse !== undefined && v < startVerse) include = false;
            if (c === endChapter && endVerse !== undefined && v > endVerse) include = false;

            if (include) {
                if (lastHeading) {
                    allFilteredBlocks.push(lastHeading);
                    lastHeading = null;
                }
                allFilteredBlocks.push(block);
            }
        }
    }

    return allFilteredBlocks.length > 0 ? allFilteredBlocks : null;
}

export async function getVersesByParsedReference(parsed: { bookId: string, chapter: number, endChapter?: number, startVerse?: number, endVerse?: number }): Promise<Verse[]> {
    const startChapter = parsed.chapter;
    const endChapter = parsed.endChapter || startChapter;
    const startVerse = parsed.startVerse;
    const endVerse = parsed.endVerse;

    const allVerses: Verse[] = [];

    for (let c = startChapter; c <= endChapter; c++) {
        const chapterVerses = await getVersesForChapter(`${parsed.bookId}.${c}`);

        const filtered = chapterVerses.filter(v => {
            if (c === startChapter && startVerse !== undefined && v.verse < startVerse) return false;
            if (c === endChapter && endVerse !== undefined && v.verse > endVerse) return false;
            return true;
        });

        allVerses.push(...filtered);
    }

    return allVerses;
}
