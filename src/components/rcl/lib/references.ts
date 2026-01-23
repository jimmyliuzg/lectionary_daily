// Bible book metadata for navigation
export const BIBLE_BOOKS = {
    oldTestament: [
        { id: 'GEN', name: 'Genesis', chapters: 50 },
        { id: 'EXO', name: 'Exodus', chapters: 40 },
        { id: 'LEV', name: 'Leviticus', chapters: 27 },
        { id: 'NUM', name: 'Numbers', chapters: 36 },
        { id: 'DEU', name: 'Deuteronomy', chapters: 34 },
        { id: 'JOS', name: 'Joshua', chapters: 24 },
        { id: 'JDG', name: 'Judges', chapters: 21 },
        { id: 'RUT', name: 'Ruth', chapters: 4 },
        { id: '1SA', name: '1 Samuel', chapters: 31 },
        { id: '2SA', name: '2 Samuel', chapters: 24 },
        { id: '1KI', name: '1 Kings', chapters: 22 },
        { id: '2KI', name: '2 Kings', chapters: 25 },
        { id: '1CH', name: '1 Chronicles', chapters: 29 },
        { id: '2CH', name: '2 Chronicles', chapters: 36 },
        { id: 'EZR', name: 'Ezra', chapters: 10 },
        { id: 'NEH', name: 'Nehemiah', chapters: 13 },
        { id: 'EST', name: 'Esther', chapters: 10 },
        { id: 'JOB', name: 'Job', chapters: 42 },
        { id: 'PSA', name: 'Psalms', chapters: 150 },
        { id: 'PRO', name: 'Proverbs', chapters: 31 },
        { id: 'ECC', name: 'Ecclesiastes', chapters: 12 },
        { id: 'SNG', name: 'Song of Solomon', chapters: 8 },
        { id: 'ISA', name: 'Isaiah', chapters: 66 },
        { id: 'JER', name: 'Jeremiah', chapters: 52 },
        { id: 'LAM', name: 'Lamentations', chapters: 5 },
        { id: 'EZK', name: 'Ezekiel', chapters: 48 },
        { id: 'DAN', name: 'Daniel', chapters: 12 },
        { id: 'HOS', name: 'Hosea', chapters: 14 },
        { id: 'JOL', name: 'Joel', chapters: 3 },
        { id: 'AMO', name: 'Amos', chapters: 9 },
        { id: 'OBA', name: 'Obadiah', chapters: 1 },
        { id: 'JON', name: 'Jonah', chapters: 4 },
        { id: 'MIC', name: 'Micah', chapters: 7 },
        { id: 'NAM', name: 'Nahum', chapters: 3 },
        { id: 'HAB', name: 'Habakkuk', chapters: 3 },
        { id: 'ZEP', name: 'Zephaniah', chapters: 3 },
        { id: 'HAG', name: 'Haggai', chapters: 2 },
        { id: 'ZEC', name: 'Zechariah', chapters: 14 },
        { id: 'MAL', name: 'Malachi', chapters: 4 },
    ],
    newTestament: [
        { id: 'MAT', name: 'Matthew', chapters: 28 },
        { id: 'MRK', name: 'Mark', chapters: 16 },
        { id: 'LUK', name: 'Luke', chapters: 24 },
        { id: 'JHN', name: 'John', chapters: 21 },
        { id: 'ACT', name: 'Acts', chapters: 28 },
        { id: 'ROM', name: 'Romans', chapters: 16 },
        { id: '1CO', name: '1 Corinthians', chapters: 16 },
        { id: '2CO', name: '2 Corinthians', chapters: 13 },
        { id: 'GAL', name: 'Galatians', chapters: 6 },
        { id: 'EPH', name: 'Ephesians', chapters: 6 },
        { id: 'PHP', name: 'Philippians', chapters: 4 },
        { id: 'COL', name: 'Colossians', chapters: 4 },
        { id: '1TH', name: '1 Thessalonians', chapters: 5 },
        { id: '2TH', name: '2 Thessalonians', chapters: 3 },
        { id: '1TI', name: '1 Timothy', chapters: 6 },
        { id: '2TI', name: '2 Timothy', chapters: 4 },
        { id: 'TIT', name: 'Titus', chapters: 3 },
        { id: 'PHM', name: 'Philemon', chapters: 1 },
        { id: 'HEB', name: 'Hebrews', chapters: 13 },
        { id: 'JAS', name: 'James', chapters: 5 },
        { id: '1PE', name: '1 Peter', chapters: 5 },
        { id: '2PE', name: '2 Peter', chapters: 3 },
        { id: '1JN', name: '1 John', chapters: 5 },
        { id: '2JN', name: '2 John', chapters: 1 },
        { id: '3JN', name: '3 John', chapters: 1 },
        { id: 'JUD', name: 'Jude', chapters: 1 },
        { id: 'REV', name: 'Revelation', chapters: 22 },
    ],
};

// Book name aliases for reference parsing
export const BOOK_ALIASES: Record<string, string> = {
    'genesis': 'GEN',
    'gen': 'GEN',
    'exodus': 'EXO',
    'exod': 'EXO',
    'ex': 'EXO',
    'leviticus': 'LEV',
    'lev': 'LEV',
    'numbers': 'NUM',
    'num': 'NUM',
    'deuteronomy': 'DEU',
    'deut': 'DEU',
    'joshua': 'JOS',
    'josh': 'JOS',
    'judges': 'JDG',
    'judg': 'JDG',
    'ruth': 'RUT',
    '1 samuel': '1SA',
    '1samuel': '1SA',
    '1 sam': '1SA',
    '1sam': '1SA',
    '2 samuel': '2SA',
    '2samuel': '2SA',
    '2 sam': '2SA',
    '2sam': '2SA',
    '1 kings': '1KI',
    '1kings': '1KI',
    '1 kgs': '1KI',
    '2 kings': '2KI',
    '2kings': '2KI',
    '2 kgs': '2KI',
    '1 chronicles': '1CH',
    '1chronicles': '1CH',
    '1 chr': '1CH',
    '2 chronicles': '2CH',
    '2chronicles': '2CH',
    '2 chr': '2CH',
    'ezra': 'EZR',
    'nehemiah': 'NEH',
    'neh': 'NEH',
    'esther': 'EST',
    'est': 'EST',
    'job': 'JOB',
    'psalm': 'PSA',
    'psalms': 'PSA',
    'ps': 'PSA',
    'proverbs': 'PRO',
    'prov': 'PRO',
    'ecclesiastes': 'ECC',
    'eccl': 'ECC',
    'song of solomon': 'SNG',
    'song of songs': 'SNG',
    'song': 'SNG',
    'isaiah': 'ISA',
    'isa': 'ISA',
    'jeremiah': 'JER',
    'jer': 'JER',
    'lamentations': 'LAM',
    'lam': 'LAM',
    'ezekiel': 'EZK',
    'ezek': 'EZK',
    'daniel': 'DAN',
    'dan': 'DAN',
    'hosea': 'HOS',
    'hos': 'HOS',
    'joel': 'JOL',
    'amos': 'AMO',
    'obadiah': 'OBA',
    'obad': 'OBA',
    'jonah': 'JON',
    'micah': 'MIC',
    'mic': 'MIC',
    'nahum': 'NAM',
    'nah': 'NAM',
    'habakkuk': 'HAB',
    'hab': 'HAB',
    'zephaniah': 'ZEP',
    'zeph': 'ZEP',
    'haggai': 'HAG',
    'hag': 'HAG',
    'zechariah': 'ZEC',
    'zech': 'ZEC',
    'malachi': 'MAL',
    'mal': 'MAL',
    'matthew': 'MAT',
    'matt': 'MAT',
    'mt': 'MAT',
    'mark': 'MRK',
    'mk': 'MRK',
    'luke': 'LUK',
    'lk': 'LUK',
    'john': 'JHN',
    'jn': 'JHN',
    'acts': 'ACT',
    'romans': 'ROM',
    'rom': 'ROM',
    '1 corinthians': '1CO',
    '1corinthians': '1CO',
    '1 cor': '1CO',
    '1cor': '1CO',
    '2 corinthians': '2CO',
    '2corinthians': '2CO',
    '2 cor': '2CO',
    '2cor': '2CO',
    'galatians': 'GAL',
    'gal': 'GAL',
    'ephesians': 'EPH',
    'eph': 'EPH',
    'philippians': 'PHP',
    'phil': 'PHP',
    'colossians': 'COL',
    'col': 'COL',
    '1 thessalonians': '1TH',
    '1thessalonians': '1TH',
    '1 thess': '1TH',
    '2 thessalonians': '2TH',
    '2thessalonians': '2TH',
    '2 thess': '2TH',
    '1 timothy': '1TI',
    '1timothy': '1TI',
    '1 tim': '1TI',
    '2 timothy': '2TI',
    '2timothy': '2TI',
    '2 tim': '2TI',
    'titus': 'TIT',
    'philemon': 'PHM',
    'phlm': 'PHM',
    'hebrews': 'HEB',
    'heb': 'HEB',
    'james': 'JAS',
    'jas': 'JAS',
    '1 peter': '1PE',
    '1peter': '1PE',
    '1 pet': '1PE',
    '2 peter': '2PE',
    '2peter': '2PE',
    '2 pet': '2PE',
    '1 john': '1JN',
    '1john': '1JN',
    '1 jn': '1JN',
    '2 john': '2JN',
    '2john': '2JN',
    '2 jn': '2JN',
    '3 john': '3JN',
    '3john': '3JN',
    '3 jn': '3JN',
    'jude': 'JUD',
    'revelation': 'REV',
    'rev': 'REV',
};

export interface ParsedReference {
    bookId: string;
    bookName: string;
    chapter: number;
    endChapter?: number;
    startVerse?: number;
    endVerse?: number;
    raw: string;
}

/**
 * Parse a Bible reference string into structured data
 * Examples: "John 3:16", "Genesis 1:1-31", "Psalm 23", "1 Corinthians 13:1-13", "1 Samuel 3:10-4:1"
 */
export function parseReference(ref: string): ParsedReference | null {
    // Match patterns like "1 John 3:16-18" or "Psalm 23" or "Genesis 1:1-2:3"
    // Groups: 1: Book, 2: Start Chapter, 3: Start Verse, 4: End Chapter or End Verse, 5: End Verse (if chapter:verse range)
    const pattern = /^([1-3]?\s?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)\s+(\d+)(?::(\d+)(?:[a-z])?)?(?:-(\d+)(?::(\d+)(?:[a-z])?)?)?/i;
    const match = ref.match(pattern);

    if (!match) return null;

    const bookName = match[1].trim();
    const bookId = BOOK_ALIASES[bookName.toLowerCase()];

    if (!bookId) return null;

    const chapter = parseInt(match[2], 10);
    const startVerse = match[3] ? parseInt(match[3], 10) : undefined;

    let endChapter = chapter;
    let endVerse = startVerse;

    if (match[5]) {
        // Cross-chapter range: 3:10-4:1
        endChapter = parseInt(match[4], 10);
        endVerse = parseInt(match[5], 10);
    } else if (match[4]) {
        // Single chapter range: 3:10-15
        endVerse = parseInt(match[4], 10);
    }

    return {
        bookId,
        bookName,
        chapter,
        endChapter,
        startVerse,
        endVerse,
        raw: ref,
    };
}

/**
 * Get display name for a book ID
 */
export function getBookName(bookId: string): string {
    const allBooks = [...BIBLE_BOOKS.oldTestament, ...BIBLE_BOOKS.newTestament];
    const book = allBooks.find(b => b.id === bookId);
    return book?.name || bookId;
}

/**
 * Format a reference for display
 */
export function formatReference(bookId: string, chapter: number, startVerse?: number, endVerse?: number): string {
    const bookName = getBookName(bookId);
    let result = `${bookName} ${chapter}`;

    if (startVerse !== undefined) {
        result += `:${startVerse}`;
        if (endVerse !== undefined && endVerse !== startVerse) {
            result += `-${endVerse}`;
        }
    }

    return result;
}
