# Lectionary Daily PWA

A beautiful, distraction-free Progressive Web App for daily liturgical readings following the Revised Common Lectionary (RCL), featuring the complete Berean Standard Bible.

## ✨ Features

### 📖 Daily Lectionary
- **Today's Readings**: Instant access to the current day's lectionary readings
- **Multi-Year Support**: Complete daily coverage for Years A, B, and C (2025-2028)
- **Swipe Navigation**: Seamlessly browse previous and future dates (also arrow keys)
- **Offline First**: All readings available without internet connection
- **Liturgical Seasons**: Proper season detection (real Easter computus) with liturgical colors on the calendar and a season badge in the header
- **Multi-Range References**: Non-contiguous readings render completely (e.g. "Ezekiel 34:11-16, 20-24" shows all verses)

### 📚 Full Bible Browser
- **Complete BSB**: The entire Berean Standard Bible offline-capable
- **Smart Navigation**: Browse by book and chapter with beautiful chapter grids
- **Book Rollover**: Reading the last chapter of a book continues into the next book (Genesis 50 → Exodus 1)
- **Structured Content**: Poetry, headings, and paragraphs rendered beautifully
- **Cross-References**: Internal scripture references for deeper study

### 🎨 Design Philosophy
- **Frosted Glass UI**: Elegant, modern header with backdrop blur effects
- **Scroll-to-Hide**: Headers disappear while reading, reappear on scroll up
- **Dark Mode**: Seamless system-based dark/light mode transitions
- **Typography**: Premium serif fonts (Newsreader, Cabin) for optimal readability
- **Responsive**: Optimized for mobile, tablet, and desktop

### 🔧 Technical Highlights
- **Fast Loading**: The initial JS bundle is ~60KB gzipped; the Bible data (~3MB gzipped) is lazy-loaded and streamed into IndexedDB in the background after first paint
- **IndexedDB**: Background Bible hydration for performance (chunked transactions)
- **Year-Agnostic**: Automatically selects the correct liturgical year
- **Astro static site generation with React islands**

## 📂 Project Structure

```
/
├── public/              # Static assets (fonts, icons, manifest)
├── scripts/
│   ├── build-lectionary.js   # Regenerates all lectionary JSON from Vanderbilt
│   └── .cache/               # Downloaded source pages (gitignored)
├── src/
│   ├── components/
│   │   └── rcl/         # RCL-specific React components
│   │       ├── TodayView.tsx       # Daily readings view
│   │       ├── ChapterView.tsx     # Bible chapter reader
│   │       ├── BibleBrowser.tsx    # Book/chapter navigation
│   │       └── lib/                # Utilities & data logic
│   ├── data/
│   │   ├── lectionary-year-a.json  # Year A readings (2025-2026)
│   │   ├── lectionary-year-b.json  # Year B readings (2026-2027)
│   │   ├── lectionary-year-c.json  # Year C readings (2027-2028)
│   │   ├── bible-bsb.json          # BSB verse data
│   │   └── bible-structured.json   # BSB with formatting
│   ├── lib/rcl/
│   │   ├── db.ts        # IndexedDB logic for Bible data
│   │   └── bibleData.ts # Lazy JSON loaders (code-split chunks)
│   └── pages/
│       └── index.astro  # Main entry point
└── tests/               # Vitest unit tests
```

## 📅 Lectionary Data

All three years are generated from the [Revised Common Lectionary](https://lectionary.library.vanderbilt.edu/) (Vanderbilt):

```
node scripts/build-lectionary.js            # use cached sources
node scripts/build-lectionary.js --fetch    # re-download sources first
```

- **Year A (2025-2026)**: Nov 30, 2025 – Nov 28, 2026
- **Year B (2026-2027)**: Nov 29, 2026 – Nov 27, 2027
- **Year C (2027-2028)**: Nov 28, 2027 – Dec 2, 2028

Sundays and feasts carry the full First Reading / Psalm / Second Reading / Gospel set; weekdays carry Psalm / Old Testament / New Testament (semi-continuous track).

**Known data gaps** (from the upstream source):
- Nov 24-26, 2025 and Nov 30 – Dec 2, 2028: Vanderbilt has not published the adjacent liturgical year's pages yet
- Mar 21, 2028: a Vanderbilt page error (the "Third Sunday in Lent" marker is duplicated on that Tuesday)

Apocryphal readings (Wisdom of Solomon, Sirach, Baruch, etc.) are omitted because the BSB is a 66-book canon; references with apocryphal alternatives use the canonical alternative.

## 🛠 Tech Stack

- **Framework**: [Astro](https://astro.build) (Static Site Generation)
- **UI Library**: [React](https://react.dev) (Component islands)
- **Styling**: Vanilla CSS with CSS Variables
- **Data Storage**: IndexedDB (via [idb](https://github.com/jakearchibald/idb))
- **Bible Text**: [Berean Standard Bible](https://berean.bible) (Public Domain)
- **Tests**: [Vitest](https://vitest.dev)

## 🎯 Usage

### As a Daily Office Tool
1. Open the app each morning
2. Read the day's assigned lectionary passages
3. Use swipe or arrow buttons to navigate adjacent days

### As a Bible Study Tool
1. Access the Full Bible from the menu
2. Browse by Testament → Book → Chapter
3. Use cross-references to explore related passages
4. Previous/Next navigation for continuous reading (buttons, edge zones, or arrow keys)

## ⚠️ Known Issues

- **PWA install/offline is currently broken**: `public/sw.js` and `public/manifest.json` reference icon files (`/rcl-icon-192.png`, `/rcl-icon-512.png`) that don't exist in `public/`, so the service worker install fails and the browser shows no install prompt. Fixing requires generating the two PNG icons from `public/favicon.svg` and updating the service worker's cache list (it also references the wrong fonts).

## 🙏 Credits

- **Bible Text**: [Berean Standard Bible](https://berean.bible) (Public Domain)
- **Lectionary**: Based on the [Revised Common Lectionary](https://lectionary.library.vanderbilt.edu/) daily readings and Sunday/feast calendars
- **Typography**: [Google Fonts](https://fonts.google.com) (Newsreader, Cabin)

## 📄 License

This project is open source and available for personal and liturgical use.
