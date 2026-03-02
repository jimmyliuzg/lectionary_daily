# Lectionary Daily PWA

A beautiful, distraction-free Progressive Web App for daily liturgical readings following the Revised Common Lectionary (RCL), featuring the complete Berean Standard Bible.

Try it here: https://lectionary-daily.pages.dev/

## ✨ Features

### 📖 Daily Lectionary
- **Today's Readings**: Instant access to the current day's lectionary readings
- **Multi-Year Support**: Complete coverage for Years A, B, and C (2025-2028)
- **Swipe Navigation**: Seamlessly browse previous and future dates
- **Offline First**: All readings available without internet connection

### 📚 Full Bible Browser
- **Complete BSB**: The entire Berean Standard Bible offline-capable
- **Smart Navigation**: Browse by book and chapter with beautiful chapter grids
- **Structured Content**: Poetry, headings, and paragraphs rendered beautifully
- **Cross-References**: Internal scripture references for deeper study

### 🎨 Design Philosophy
- **Frosted Glass UI**: Elegant, modern header with backdrop blur effects
- **Scroll-to-Hide**: Headers disappear while reading, reappear on scroll up
- **Dark Mode**: Seamless system-based dark/light mode transitions
- **Typography**: Premium serif fonts (Newsreader, Cabin) for optimal readability
- **Responsive**: Optimized for mobile, tablet, and desktop
- **Mobile-Friendly**: Includes swipe based gestures for mobile friendly navigation

### 🔧 Technical Highlights
- **PWA**: Installable, full offline support via Service Worker
- **IndexedDB**: Background Bible hydration for performance
- **Year-Agnostic**: Automatically selects the correct liturgical year
- **Fast Loading**: Astro static site generation with React islands

## 📂 Project Structure

```
/
├── public/              # Static assets (fonts, icons, manifest)
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
│   │   ├── bible.json              # BSB verse data
│   │   └── bible-structured.json   # BSB with formatting
│   ├── lib/rcl/
│   │   └── db.ts        # IndexedDB logic for Bible data
│   ├── pages/
│   │   └── index.astro  # Main entry point
│   └── workers/
│       └── hydration-worker.ts     # Background Bible loading
└── package.json
```

## 📅 Lectionary Data

The app includes complete daily readings for the RCL three-year cycle:

- **Year A (2025-2026)**: Sundays, major feasts, and all weekdays

Readings include:
- Psalm of the day
- Old Testament reading
- New Testament/Epistle reading
- Gospel reading (Sundays and feasts)

## 🛠 Tech Stack

- **Framework**: [Astro](https://astro.build) (Static Site Generation)
- **UI Library**: [React](https://react.dev) (Component islands)
- **Styling**: Vanilla CSS with CSS Variables
- **Data Storage**: IndexedDB (via [idb](https://github.com/jakearchibald/idb))
- **Bible Text**: [Berean Standard Bible](https://berean.bible) (Public Domain)
- **PWA**: Service Worker with offline caching

## 🎯 Usage

### As a Daily Office Tool
1. Open the app each morning
2. Read the day's assigned lectionary passages
3. Use swipe or arrow buttons to navigate adjacent days

### As a Bible Study Tool
1. Access the Full Bible from the menu
2. Browse by Testament → Book → Chapter
3. Use cross-references to explore related passages
4. Previous/Next navigation for continuous reading

## 📱 Install as PWA

The app can be installed on any device:

1. **Desktop**: Click the install button in your browser's address bar
2. **iOS**: Safari → Share → "Add to Home Screen"
3. **Android**: Chrome → Menu → "Install app"

Once installed, the app works completely offline!

## 🙏 Credits

- **Bible Text**: [Berean Standard Bible](https://berean.bible) (Public Domain)
- **Lectionary**: Based on the [Revised Common Lectionary](https://lectionary.library.vanderbilt.edu/)
- **Typography**: [Google Fonts](https://fonts.google.com) (Newsreader, Cabin)

## 📄 License

This project is open source and available for personal and liturgical use.

## 🤝 Contributing

To add readings for Year B or Year C, see the data structure in:
- `src/data/lectionary-year-a.json` (reference implementation)
- Lectionary data follows the standard RCL three-year cycle

---

*Built with ❤️ for daily prayer and scripture reading*
