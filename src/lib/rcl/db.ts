import { openDB, type IDBPDatabase } from 'idb';

export interface Verse {
    uvid: number;
    ref: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface Book {
    id: string;
    name: string;
    testament: string;
    chapters: number;
}

const DB_NAME = 'rcl-bible-db';
const DB_VERSION = 1;

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

export async function hydrateBible(data: { verses: Verse[], books: Book[] }) {
    const db = await initDB();

    console.log('Starting Bible hydration into IndexedDB...');

    // Clear existing data (optional, but good for fresh starts)
    const tx = db.transaction(['verses', 'books', 'metadata'], 'readwrite');
    await tx.objectStore('verses').clear();
    await tx.objectStore('books').clear();

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

export async function getVersesByParsedReference(parsed: { bookId: string, chapter: number, startVerse?: number, endVerse?: number }): Promise<Verse[]> {
    const chapterVerses = await getVersesForChapter(`${parsed.bookId}.${parsed.chapter}`);

    if (parsed.startVerse === undefined) {
        return chapterVerses;
    }

    const start = parsed.startVerse;
    const end = parsed.endVerse || start;

    return chapterVerses.filter(v => v.verse >= start && v.verse <= end);
}
