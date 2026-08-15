// Rebuilds src/data/lectionary-year-{a,b,c}.json from Vanderbilt's Revised
// Common Lectionary pages:
//   - "Daily Readings" full-year pages (weekday Psalm/OT/NT lections)
//   - "Calendar" CSV downloads (Sunday/feast day First/Psalm/Second/Gospel)
//
// Usage:
//   node scripts/build-lectionary.js            # use cached sources
//   node scripts/build-lectionary.js --fetch    # re-download sources first
//
// Source URLs (Vanderbilt lectionary.library.vanderbilt.edu):
//   daily:  /daily-readings/?y=<id>     A=17134 B=18921 C=19342
//   csv:    /calendar/<lit-year>/?season=all&download=csv

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(__dirname, '.cache');
const OUT = path.join(__dirname, '..', 'src', 'data');

const BASE = 'https://lectionary.library.vanderbilt.edu';

const YEARS = {
  A: { pageId: 17134, litYear: '2025-2026', csv: 'calendar-A.csv', daily: 'daily-A.html' },
  B: { pageId: 18921, litYear: '2026-2027', csv: 'calendar-B.csv', daily: 'daily-B.html' },
  C: { pageId: 19342, litYear: '2027-2028', csv: 'calendar-C.csv', daily: 'daily-C.html' },
};

// ---------------------------------------------------------------------------
// Source fetching (cached)

async function fetchTo(url, file) {
  const dest = path.join(CACHE, file);
  if (fs.existsSync(dest) && !process.argv.includes('--fetch')) return;
  console.log('fetching', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  fs.writeFileSync(dest, await res.text());
}

async function loadSources() {
  for (const y of Object.values(YEARS)) {
    await fetchTo(`${BASE}/daily-readings/?y=${y.pageId}`, y.daily);
    await fetchTo(`${BASE}/calendar/${y.litYear}/?season=all&download=csv`, y.csv);
  }
}

// ---------------------------------------------------------------------------
// Constants

const MONTHS = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

const BOOK_STARTS = [
  'Psalm', 'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings',
  '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job',
  'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah',
  'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John',
  'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians',
  '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation', 'Song of Solomon', 'Ecclesiastes', 'Proverbs',
];

const APOCRYPHA = [
  'Tobit', 'Judith', 'Wisdom of Solomon', 'Wisdom', 'Sirach', 'Baruch',
  '1 Maccabees', '2 Maccabees', '3 Maccabees', '4 Maccabees',
  'Prayer of Azariah', 'Susanna', 'Bel and the Dragon',
  'Additions to Esther', 'Song of the Three', 'Letter of Jeremiah',
  'Prayer of Manasseh', 'Esdras',
];

// Any book-like token (canon + apocrypha) — used to recognise refs in the raw
// page text. Apocryphal readings are dropped later via isApocryphal.
const ALL_BOOK_STARTS = [...BOOK_STARTS, ...APOCRYPHA];
const isRef = (s) => ALL_BOOK_STARTS.some((b) => s === b || s.startsWith(b + ' '));
const isApocryphal = (ref) => APOCRYPHA.some((a) => ref.startsWith(a + ' ') || ref === a);

// Split glued readings on one line/field into separate refs. A boundary is
// a book-name token followed by a chapter number (handles "Psalm 39; Numbers
// 13:17-27, Luke 13:18-21" and "... 2 Chronicales 1:7-13, Mark 13:32-37"),
// while ranges like "Exodus 14:10-31; 15:20-21" stay one ref because the
// continuation has no book name.
function splitRefs(line) {
  return splitGluedReadings(line.replace(/;\s*$/, '').trim());
}

// ---------------------------------------------------------------------------
// Daily page parsing

function parseDailyPage(html) {
  const main = html.slice(html.indexOf('<main'), html.lastIndexOf('</main>'));
  const txt = main
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '-')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ');
  const lines = txt.split('\n').map((s) => s.trim()).filter(Boolean);
  const dateRe = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), ([A-Za-z]+) (\d{1,2}), (\d{4}):$/;
  const seasons = new Set([
    'Advent', 'Christmas', 'Epiphany', 'Lent', 'Holy Week', 'Easter',
    'Season after Pentecost', 'Season after Christ the King', 'Trinity', 'Pentecost',
  ]);

  const entries = []; // { date, dow, kind: 'daily'|'named', name?, refs[] }
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(dateRe);
    if (!m) { i++; continue; }
    const date = `${m[4]}-${String(MONTHS[m[2]]).padStart(2, '0')}-${String(+m[3]).padStart(2, '0')}`;
    const dow = m[1];
    i++;
    const content = [];
    while (i < lines.length) {
      const l = lines[i];
      if (dateRe.test(l) || seasons.has(l)) break;
      content.push(l);
      i++;
    }
    const first = content[0];
    if (!first) continue;
    if (first === 'Semi-continuous:') {
      // Ordinary Time: labeled dual-track format
      const refs = [];
      for (const l of content) {
        if (l === 'Complementary:') break;
        if (l === 'Semi-continuous:') continue;
        if (isRef(l)) refs.push(...splitRefs(l.replace(/;\s*$/, '').trim()));
      }
      entries.push({ date, dow, kind: 'daily', refs });
    } else if (isRef(first)) {
      // Advent through Easter: unlabeled format — refs straight after the date
      const refs = [];
      for (const l of content) {
        if (!isRef(l)) break;
        refs.push(...splitRefs(l.replace(/;\s*$/, '').trim()));
      }
      entries.push({ date, dow, kind: 'daily', refs });
    } else {
      entries.push({ date, dow, kind: 'named', name: first });
    }
  }
  return entries;
}

// ---------------------------------------------------------------------------
// CSV parsing

function parseDateStr(s) {
  const m = s.trim().match(/^([A-Za-z]+) (\d{1,2}), (\d{4})$/);
  if (!m) throw new Error('bad date: ' + s);
  return `${m[3]}-${String(MONTHS[m[1]]).padStart(2, '0')}-${String(+m[2]).padStart(2, '0')}`;
}

function parseCSV(text) {
  text = text
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '-')
    .replace(/&#8217;|&rsquo;/g, "'")
    .replace(/&#8220;|&ldquo;/g, '"')
    .replace(/&#8221;|&rdquo;/g, '"')
    .replace(/&amp;/g, '&');
  const rows = [];
  let row = [];
  let field = '';
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  const named = []; // { date, name, raw: [first, psalm, second, gospel] }
  for (const r of rows) {
    if (!r || !r[0]) continue;
    if (r[0] === 'Liturgical Date') continue;
    if (r[0].startsWith('Revised Common Lectionary')) continue;
    if (r[0].startsWith('Scripture Citations')) continue;
    if (r[0].startsWith('http')) continue;
    const date = parseDateStr(r[1]);
    named.push({ date, name: r[0].trim(), raw: r.slice(2, 6) });
  }
  return named;
}

// ---------------------------------------------------------------------------
// Reading normalization

const reGluedPsalm = / Psalm \d/;

// Split "X... Psalm N..." -> [reading, psalm] when a psalm is glued after a
// reading (Vanderbilt CSV quirk). Skips "Psalm A or Psalm B" alternates.
function splitGluedPsalm(field) {
  let search = 0;
  while (true) {
    const m = field.slice(search).match(reGluedPsalm);
    if (!m) return [field, null];
    const at = search + m.index;
    if (field.slice(Math.max(0, at - 3), at).trim() !== 'or') {
      return [field.slice(0, at), field.slice(at + 1)];
    }
    search = at + 1;
  }
}

// Pick the first alternative of an "A or B or C" list that is in the canon.
function pickAlternative(field) {
  if (!field) return null;
  const parts = field.split(/\s+or\s+/).map((s) => s.trim()).filter(Boolean);
  for (const p of parts) {
    if (!isApocryphal(p)) return p;
  }
  return null;
}

// Reject references whose chapters exceed the book's chapter count (catches
// page typos like "Romans:18-30" or "2 Chronicles 22:1-19" style breakage).
function chapterCheck(ref, chaptersMap) {
  const bookName = ref.match(/^([1-3]?\s?[A-Za-z]+(?:\s+of\s+[A-Za-z]+)?)/)?.[1]?.trim();
  if (!bookName) return 'unparseable book';
  const max = chaptersMap[bookName];
  if (!max) return `book not in BSB: ${bookName}`;
  if (max === 1 && !ref.includes(':')) return null; // single-chapter book: bare numbers are verses
  const nums = [];
  const first = ref.match(/^\S+\s+(\d+)/);
  if (first) nums.push(+first[1]);
  for (const m of ref.matchAll(/(\d+):/g)) nums.push(+m[1]);
  for (const n of nums) if (n > max) return `chapter ${n} > ${max} chapters`;
  return null;
}

// Fix known typos in the source data (Vanderbilt page errors).
const TYPO_MAP = {
  '1 King ': '1 Kings ',
  '1King ': '1 Kings ',
  '1John ': '1 John ',
  '2 Chronicales ': '2 Chronicles ',
  'Chronicales ': 'Chronicles ',
};

// Split a possibly-glued ref string into separate refs. Vanderbilt's daily
// pages sometimes glue several readings into one comma/space-separated field
// (e.g. "Psalm 147:12-20, 2 Chronicales 1:7-13, Mark 13:32-37" or
// "Lamentations 1:1-6 Lamentations 3:19-26"). A new reading starts at a
// book-name token followed by a chapter number (space or colon separated).
function splitGluedReadings(field) {
  // A new reading starts at a book-name token followed by a chapter number.
  // " or <Book>" alternatives are NOT new readings ("Jeremiah 31:7-14 or
  // Sirach 24:1-12" stays one ref).
  const re = /(^|[,;]\s*|\s)(?<!or )([1-3]?\s?[A-Z][a-z]+(?:\s+(?:of\s+)?[A-Z][a-z]+)*)(?=\s*:?\d)/g;
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(field)) !== null) {
    if (m[1] === '') continue; // the first ref's own book
    parts.push(field.slice(last, m.index).trim());
    last = m.index + m[1].length;
  }
  parts.push(field.slice(last).trim());
  return parts.filter(Boolean);
}

function normalizeRef(ref) {
  if (!ref) return null;
  let s = ref;
  for (const [typo, fix] of Object.entries(TYPO_MAP)) s = s.replaceAll(typo, fix);
  return s
    .replace(/^\*\s*/, '')
    .replace(/\s+and\s+/g, ', ')
    .replace(/([A-Za-z]+)(\d+):/g, '$1 $2:')   // "2 Peter1:16-21" -> "2 Peter 1:16-21"
    .replace(/([A-Za-z]):(\d)/g, '$1 $2')   // "Luke:19:41-44" -> "Luke 19:41-44"
    .replace(/ :(\d+):/g, ' $1:')            // "Acts :9:19b-25" -> "Acts 9:19b-25"
    .replace(/:\s+/g, ':')
    .replace(/\s*-\s*/g, '-')
    .replace(/([0-9a-zA-Z])\(/g, '$1, (')
    .replace(/([^,\s])\s+\(/g, '$1, (')       // "1-9a (9b-12)" -> "1-9a, (9b-12)"
    .replace(/\)\s*(\d)/g, '), $1')            // "1:(1-9) 10-18" -> "1:(1-9), 10-18"
    .replace(/\s+/g, ' ')
    .trim();
}

// Build a [First Reading, Psalm, Second Reading, Gospel] list from one CSV row.
function readingsFromRow(raw) {
  const [firstRaw, psalmRaw, secondRaw, gospelRaw] = raw.map((s) => (s || '').trim().replace(/^\*+\s*/, ''));

  // The first-reading column often has the psalm glued to it
  // ("Gen 12:1-9 Psalm 33:1-12" or "1 Sam 1:4-20 1 Sam 2:1-10").
  const firstParts = splitGluedReadings(firstRaw);
  const firstPick = pickAlternative(firstParts[0] || '');
  const first = firstPick !== null ? normalizeRef(firstPick) : null;

  // Psalm priority: glued psalm from the first column > psalm column > extra
  // reading glued into the first column.
  let psalm = null;
  const gluedPsalm = firstParts.slice(1).find((p) => p.trim().startsWith('Psalm'));
  if (gluedPsalm) {
    const p = pickAlternative(gluedPsalm);
    if (p !== null) psalm = normalizeRef(p);
  } else {
    // Psalm column may carry a glued alternate-OT pattern on some rows
    // (e.g. Proper 26 "Micah 3:5-12 Psalm 43") — extract the actual psalm.
    const [psPart, psGlued] = splitGluedPsalm(psalmRaw);
    const p = pickAlternative(psGlued || psPart);
    if (p !== null && p.startsWith('Psalm')) psalm = normalizeRef(p);
    if (psalm === null) {
      const extra = firstParts.slice(1).find((p) => !isApocryphal(p));
      if (extra) psalm = normalizeRef(extra);
    }
  }

  const second = pickAlternative(secondRaw);
  const gospel = pickAlternative(gospelRaw);

  const out = [];
  if (first !== null) out.push({ type: 'First Reading', reference: first });
  if (psalm !== null) out.push({ type: 'Psalm', reference: psalm });
  if (second !== null) out.push({ type: 'Second Reading', reference: second });
  if (gospel !== null) out.push({ type: 'Gospel', reference: gospel });
  return out;
}

// ---------------------------------------------------------------------------
// Day names

const DAYNAME_RENAMES = {
  'Reign of Christ - Proper 29 (34)': 'Christ the King Sunday',
  'Resurrection of the Lord': 'Easter Sunday',
  'All Saints Day': "All Saints' Day",
  'Nativity of the Lord - Proper I': 'Christmas Eve',
  'Nativity of the Lord - Proper II': 'Christmas Day',
};

function sundayName(name) {
  // "Proper 5 (10)" -> "Proper 5 / Ordinary Time 10"
  const m = name.match(/^Proper (\d+) \((\d+)\)$/);
  if (m) return `Proper ${m[1]} / Ordinary Time ${m[2]}`;
  return DAYNAME_RENAMES[name] || name;
}

// Weekday naming. Matches the conventions used by the existing Year A data:
//  - Mon-Wed: "Reflection on <prev Sunday>" / "after Epiphany N"
//  - Thu-Sat: "Preparation for <next Sunday>" / "after Epiphany N"
//  - Lent weeks: "in Lent N"; Holy Week: "of Holy Week"; Easter octave: "of Easter Week"
function weekdayName(dow, prevName, nextName) {
  const d = dow;
  prevName = prevName || '';
  nextName = nextName || '';
  const ord = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 1, Friday: 1, Saturday: 1 }[dow];
  const anchorName = ord === 0 ? prevName : nextName;
  const reflection = ord === 0 ? 'Reflection on' : 'Preparation for';

  if (prevName === 'Ash Wednesday') return `${d} after Ash Wednesday`;
  if (nextName === 'Ash Wednesday' && dow !== 'Monday') return `${d} before Ash Wednesday`;

  // Lent: whole week named by the previous Sunday
  const lent = prevName.match(/^(First|Second|Third|Fourth|Fifth) Sunday in Lent$/);
  if (lent) {
    const n = { First: 1, Second: 2, Third: 3, Fourth: 4, Fifth: 5 }[lent[1]];
    return `${d} in Lent ${n}`;
  }
  if (prevName === 'Palm Sunday / Passion Sunday' && ord === 0) return `${d} of Holy Week`;
  if (prevName === 'Easter Sunday') return `${d} of Easter Week`;

  // Epiphany season (Baptism = Epiphany 1, Transfiguration = Epiphany 6)
  const epiphanyN = (name) => {
    const m = name && name.match(/^(First|Second|Third|Fourth|Fifth) Sunday after the Epiphany$/);
    if (m) return { First: 1, Second: 2, Third: 3, Fourth: 4, Fifth: 5 }[m[1]];
    if (name === 'Baptism of the Lord') return 1;
    if (name === 'Transfiguration Sunday') return 6;
    return null;
  };
  const eN = ord === 0 ? epiphanyN(prevName) : epiphanyN(nextName);
  if (eN !== null) return `${d} after Epiphany ${eN}`;

  // Christmas season
  const christmasN = (name) => {
    const m = name && name.match(/^(First|Second|Third) Sunday after Christmas Day$/);
    return m ? { First: 1, Second: 2, Third: 3 }[m[1]] : null;
  };
  const cN = ord === 0 ? christmasN(prevName) : christmasN(nextName);
  if (cN !== null) return `${d} after Christmas ${cN}`;
  if (prevName === 'Christmas Day') return `${d} after Christmas Day`;
  if (prevName === 'Epiphany of the Lord') return `${d} after the Epiphany`;

  // Generic: "<Dow> - Reflection on <Sunday name>" / "<Dow> - Preparation for <Sunday name>"
  if (anchorName) return `${d} - ${reflection} ${anchorName}`;
  return d;
}

// ---------------------------------------------------------------------------
// Build

const pageRange = {
  A: ['2025-11-27', '2026-11-26'],
  B: ['2026-11-26', '2027-11-25'],
  C: ['2027-11-25', '2028-11-29'],
};

function pageForDate(date) {
  for (const [yr, [s, e]] of Object.entries(pageRange)) {
    if (date >= s && date <= e) return yr;
  }
  return null;
}

function getRCLYear(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  const christmas = new Date(y, 11, 25);
  const christmasDay = christmas.getDay() || 7;
  const adventStart = new Date(y, 11, 25 - christmasDay - 21);
  const date = new Date(y, mo - 1, d);
  const litYear = date >= adventStart ? y + 1 : y;
  return ['C', 'A', 'B'][litYear % 3];
}

// Named-day priority when a calendar date has several CSV rows (e.g. Trinity
// vs. Visitation, All Saints vs. Proper 26, Nativity Proper II vs. III).
const ROW_PRIORITY = [
  'Resurrection of the Lord',
  'Trinity Sunday',
  'All Saints Day',
  'Liturgy of the Passion',
  'Nativity of the Lord - Proper II',
  'Holy Name of Jesus',
];

function pickCsvRow(rows) {
  for (const name of ROW_PRIORITY) {
    const found = rows.find((r) => r.name === name);
    if (found) return found;
  }
  return rows[0];
}

function build() {
  const pages = {};
  const cals = {};
  for (const [yr, cfg] of Object.entries(YEARS)) {
    pages[yr] = parseDailyPage(fs.readFileSync(path.join(CACHE, cfg.daily), 'utf8'));
    cals[yr] = parseCSV(fs.readFileSync(path.join(CACHE, cfg.csv), 'utf8'));
  }

  // Book chapter counts from the BSB metadata, used to validate references.
  const bsb = JSON.parse(fs.readFileSync(path.join(OUT, 'bible-bsb.json'), 'utf8'));
  const chaptersMap = Object.fromEntries(bsb.books.map((b) => [b.name, b.chapters]));

  const dailyByDate = {};
  const namedByDate = {};
  const csvByDate = {};
  for (const [yr, entries] of Object.entries(pages)) {
    dailyByDate[yr] = new Map();
    namedByDate[yr] = new Map();
    for (const e of entries) {
      if (e.kind === 'daily') {
        if (!dailyByDate[yr].has(e.date)) dailyByDate[yr].set(e.date, e.refs);
      } else {
        if (!namedByDate[yr].has(e.date)) namedByDate[yr].set(e.date, []);
        namedByDate[yr].get(e.date).push(e.name);
      }
    }
  }
  for (const [yr, rows] of Object.entries(cals)) {
    csvByDate[yr] = new Map();
    for (const row of rows) {
      if (!csvByDate[yr].has(row.date)) csvByDate[yr].set(row.date, []);
      csvByDate[yr].get(row.date).push(row);
    }
  }

  const file = { A: [], B: [], C: [] };
  const warnings = [];

  let d = new Date(2025, 10, 24); // 2025-11-24
  const end = new Date(2028, 11, 2); // 2028-12-02
  const dowNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  while (d <= end) {
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dow = dowNames[d.getDay()];
    const rclYear = getRCLYear(date);
    const page = pageForDate(date);

    if (!page) {
      warnings.push(`${date}: no source page (${dow}, RCL year ${rclYear})`);
      d.setDate(d.getDate() + 1);
      continue;
    }

    const markers = namedByDate[page].get(date) || [];
    const dailyRefs = dailyByDate[page].get(date) || null;
    const csvRows = csvByDate[page].get(date) || [];

    if (markers.length > 0 && csvRows.length > 0) {
      const row = pickCsvRow(csvRows);
      let name = sundayName(row.name);
      let readings;
      if (row.name === 'Liturgy of the Passion') {
        // Palm Sunday / Passion Sunday: psalm from the Palms row, rest from the Passion row
        const palms = csvRows.find((r) => r.name === 'Liturgy of the Palms');
        const palPs = palms ? splitGluedPsalm(palms.raw[1])[0] : null;
        const mk = (raw, idx) => {
          const p = pickAlternative(raw[idx]);
          return p ? normalizeRef(p) : null;
        };
        readings = [
          { type: 'First Reading', reference: mk(row.raw, 0) },
          { type: 'Psalm', reference: palPs ? normalizeRef(pickAlternative(palPs)) : null },
          { type: 'Second Reading', reference: mk(row.raw, 2) },
          { type: 'Gospel', reference: mk(row.raw, 3) },
        ].filter((r) => r.reference);
        name = 'Palm Sunday / Passion Sunday';
      } else {
        readings = readingsFromRow(row.raw);
      }
      readings = readings
        .map((r) => ({ ...r, reference: normalizeRef(r.reference) }))
        .filter((r) => r.reference);
      const entry = { date, dayName: name, readings };
      if (dow === 'Sunday') entry.isSunday = true;
      file[rclYear].push(entry);
    } else if (dailyRefs) {
      // Weekday: Psalm, Old Testament, New Testament (semi-continuous set)
      const types = ['Psalm', 'Old Testament', 'New Testament'];
      const readings = [];
      for (const raw of dailyRefs) {
        if (readings.length >= 3) break;
        const ref = normalizeRef(raw);
        if (!ref) continue;
        if (isApocryphal(ref)) {
          warnings.push(`${date}: dropped apocryphal reading "${ref}"`);
          continue;
        }
        const reason = chapterCheck(ref, chaptersMap);
        if (reason) {
          warnings.push(`${date}: dropped "${ref}" (${reason})`);
          continue;
        }
        readings.push({ type: types[readings.length], reference: ref });
      }
      if (readings.length === 0) {
        warnings.push(`${date}: no usable readings (${dow})`);
        d.setDate(d.getDate() + 1);
        continue;
      }
      const prevName = nearestNamed(csvByDate[page], date, -1);
      const nextName = nearestNamed(csvByDate[page], date, +1);
      const dayName = weekdayName(dow, prevName, nextName);
      file[rclYear].push({ date, dayName, readings });
    } else {
      warnings.push(`${date}: no data (${dow}, page ${page})`);
    }

    d.setDate(d.getDate() + 1);
  }

  for (const [yr, entries] of Object.entries(file)) {
    entries.sort((a, b) => (a.date < b.date ? -1 : 1));
    const out = { year: yr, liturgicalYear: YEARS[yr].litYear, readings: entries };
    const filePath = path.join(OUT, `lectionary-year-${yr.toLowerCase()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(out, null, 2));
    const dates = entries.map((e) => e.date);
    console.log(`Year ${yr}: ${entries.length} entries, ${dates[0]} .. ${dates[dates.length - 1]}`);
  }
  console.log(`\n${warnings.length} warnings:`);
  for (const w of warnings) console.log('  ' + w);
}

// Nearest named day in a year's CSV strictly before (dir=-1) or after (dir=+1) date.
// Same-date CSV rows (Easter Vigil/Resurrection/Evening, etc.) are resolved with
// the same priority as pickCsvRow.
function nearestNamed(csvByDate, date, dir) {
  let best = null; // { date, rows }
  for (const rows of csvByDate.values()) {
    for (const row of rows) {
      if (dir < 0 && row.date < date && (!best || row.date > best.date)) best = { date: row.date, rows: [row] };
      else if (dir < 0 && row.date < date && row.date === best.date) best.rows.push(row);
      if (dir > 0 && row.date > date && (!best || row.date < best.date)) best = { date: row.date, rows: [row] };
      else if (dir > 0 && row.date > date && row.date === best.date) best.rows.push(row);
    }
  }
  if (!best) return null;
  return sundayName(pickCsvRow(best.rows).name);
}

// ---------------------------------------------------------------------------

await loadSources();
build();
