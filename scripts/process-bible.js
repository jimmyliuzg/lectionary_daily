import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const bookMapping = {
    "Genesis": { id: "GEN", testament: "OT" },
    "Exodus": { id: "EXO", testament: "OT" },
    "Leviticus": { id: "LEV", testament: "OT" },
    "Numbers": { id: "NUM", testament: "OT" },
    "Deuteronomy": { id: "DEU", testament: "OT" },
    "Joshua": { id: "JOS", testament: "OT" },
    "Judges": { id: "JDG", testament: "OT" },
    "Ruth": { id: "RUT", testament: "OT" },
    "1 Samuel": { id: "1SA", testament: "OT" },
    "2 Samuel": { id: "2SA", testament: "OT" },
    "1 Kings": { id: "1KI", testament: "OT" },
    "2 Kings": { id: "2KI", testament: "OT" },
    "1 Chronicles": { id: "1CH", testament: "OT" },
    "2 Chronicles": { id: "2CH", testament: "OT" },
    "Ezra": { id: "EZR", testament: "OT" },
    "Nehemiah": { id: "NEH", testament: "OT" },
    "Esther": { id: "EST", testament: "OT" },
    "Job": { id: "JOB", testament: "OT" },
    "Psalm": { id: "PSA", testament: "OT" },
    "Psalms": { id: "PSA", testament: "OT" },
    "Proverbs": { id: "PRO", testament: "OT" },
    "Ecclesiastes": { id: "ECC", testament: "OT" },
    "Song of Solomon": { id: "SNG", testament: "OT" },
    "Isaiah": { id: "ISA", testament: "OT" },
    "Jeremiah": { id: "JER", testament: "OT" },
    "Lamentations": { id: "LAM", testament: "OT" },
    "Ezekiel": { id: "EZK", testament: "OT" },
    "Daniel": { id: "DAN", testament: "OT" },
    "Hosea": { id: "HOS", testament: "OT" },
    "Joel": { id: "JOL", testament: "OT" },
    "Amos": { id: "AMO", testament: "OT" },
    "Obadiah": { id: "OBA", testament: "OT" },
    "Jonah": { id: "JON", testament: "OT" },
    "Micah": { id: "MIC", testament: "OT" },
    "Nahum": { id: "NAM", testament: "OT" },
    "Habakkuk": { id: "HAB", testament: "OT" },
    "Zephaniah": { id: "ZEP", testament: "OT" },
    "Haggai": { id: "HAG", testament: "OT" },
    "Zechariah": { id: "ZEC", testament: "OT" },
    "Malachi": { id: "MAL", testament: "OT" },
    "Matthew": { id: "MAT", testament: "NT" },
    "Mark": { id: "MRK", testament: "NT" },
    "Luke": { id: "LUK", testament: "NT" },
    "John": { id: "JHN", testament: "NT" },
    "Acts": { id: "ACT", testament: "NT" },
    "Romans": { id: "ROM", testament: "NT" },
    "1 Corinthians": { id: "1CO", testament: "NT" },
    "2 Corinthians": { id: "2CO", testament: "NT" },
    "Galatians": { id: "GAL", testament: "NT" },
    "Ephesians": { id: "EPH", testament: "NT" },
    "Philippians": { id: "PHP", testament: "NT" },
    "Colossians": { id: "COL", testament: "NT" },
    "1 Thessalonians": { id: "1TH", testament: "NT" },
    "2 Thessalonians": { id: "2TH", testament: "NT" },
    "1 Timothy": { id: "1TI", testament: "NT" },
    "2 Timothy": { id: "2TI", testament: "NT" },
    "Titus": { id: "TIT", testament: "NT" },
    "Philemon": { id: "PHM", testament: "NT" },
    "Hebrews": { id: "HEB", testament: "NT" },
    "James": { id: "JAS", testament: "NT" },
    "1 Peter": { id: "1PE", testament: "NT" },
    "2 Peter": { id: "2PE", testament: "NT" },
    "1 John": { id: "1JN", testament: "NT" },
    "2 John": { id: "2JN", testament: "NT" },
    "3 John": { id: "3JN", testament: "NT" },
    "Jude": { id: "JUD", testament: "NT" },
    "Revelation": { id: "REV", testament: "NT" }
};

const inputPath = path.resolve('src/data/bible-bsb.csv');
const outputPath = path.resolve('src/data/bible-bsb.json');

console.log(`Reading CSV from ${inputPath}...`);
const input = fs.readFileSync(inputPath, 'utf8');

console.log('Parsing CSV...');
const records = parse(input, {
    columns: true,
    skip_empty_lines: true
});

const verses = [];
const bookInfoMap = new Map();

console.log('Processing records...');
records.forEach((record) => {
    const verseRef = record.Verse; // e.g., "Genesis 1:1" or "1 Samuel 1:1"

    // Regex to match "Book Name Chapter:Verse"
    // Handles book names with spaces and numbers (e.g., "1 Samuel")
    const match = verseRef.match(/^(.+)\s(\d+):(\d+)$/);

    if (!match) {
        console.warn(`Warning: Could not parse verse reference "${verseRef}"`);
        return;
    }

    const [_, bookName, chapterStr, verseStr] = match;
    const mapping = bookMapping[bookName];

    if (!mapping) {
        console.warn(`Warning: No mapping found for book "${bookName}"`);
        return;
    }

    const bookId = mapping.id;
    const chapter = parseInt(chapterStr, 10);
    const verseNum = parseInt(verseStr, 10);
    const uvid = parseInt(record.ID, 10);

    const verse = {
        uvid,
        ref: `${bookId}.${chapter}.${verseNum}`,
        book: bookName,
        chapter,
        verse: verseNum,
        text: record.Text
    };

    verses.push(verse);

    if (!bookInfoMap.has(bookId)) {
        bookInfoMap.set(bookId, {
            id: bookId,
            name: bookName,
            testament: mapping.testament,
            chapters: new Set()
        });
    }
    bookInfoMap.get(bookId).chapters.add(chapter);
});

const books = Array.from(bookInfoMap.values()).map(book => ({
    id: book.id,
    name: book.name,
    testament: book.testament,
    chapters: book.chapters.size
}));

const result = {
    verses,
    books
};

console.log(`Writing JSON to ${outputPath}...`);
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log('Done! Processed', verses.length, 'verses in', books.length, 'books.');
