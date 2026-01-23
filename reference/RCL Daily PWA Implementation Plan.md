RCL Daily PWA Implementation Plan
A minimalist, offline-capable Progressive Web App for liturgical reading, serving RCL Year A readings with full BSB Bible access.

User Review Required
IMPORTANT

Data Sourcing: The BSB Bible is public domain. I'll create a script to download and convert the official data to JSON. The RCL lectionary data will need to be manually curated or sourced - do you have a preferred source, or should I compile it from publicly available RCL calendars?

WARNING

Scope: This is a substantial app (~15+ React components, PWA infrastructure, IndexedDB). I'll implement in phases. The first delivery will focus on core reading functionality; search and full offline hydration can be polished in follow-up iterations.

Proposed Changes
Data Layer
[NEW] 
lectionary-2026.json
RCL Year A readings for 2026, structured by date with references to First Reading, Psalm, Second Reading, and Gospel.

[NEW] 
bible-bsb.json
Complete BSB Bible (~5MB) with UVID indexing for fast lookup:

{
  "verses": [
    { "uvid": 1, "ref": "GEN.1.1", "book": "Genesis", "chapter": 1, "verse": 1, "text": "In the beginning..." }
  ],
  "books": [
    { "id": "GEN", "name": "Genesis", "chapters": 50 }
  ]
}
[NEW] 
download-bsb.js
Script to download BSB from official source and convert to JSON format.

Layout & Entry Point
[NEW] 
RCLLayout.astro
Standalone layout for the RCL app with:

Serif typography (Lora font) for reading
PWA meta tags and manifest link
Service worker registration
Dark mode support
[NEW] 
index.astro
Main entry point mounting the React app with client:only="react".

React Components (src/components/rcl/)
[NEW] 
RCLApp.tsx
Main app container with:

Client-side routing (Today, Bible, Search, Calendar views)
Sidebar toggle for mobile
Theme context provider
Data loading state management
[NEW] 
TodayView.tsx
Primary landing view showing current day's readings:

Auto-calculates current date and liturgical week
Displays 4 readings (First, Psalm, Second, Gospel)
Swipe/scroll navigation for ±7 days
Uses touch gestures on mobile, arrows on desktop
[NEW] 
ReadingCard.tsx
Individual reading display component:

Collapsible section with reading type header
Verse text with reference links
Cross-reference parsing and linking
[NEW] 
RCLSidebar.tsx
Navigation sidebar with:

Today's Lectionary (primary)
Search
Calendar
Full Bible
Dark mode toggle
Offline status indicator (green checkmark)
[NEW] 
BibleBrowser.tsx
Book > Chapter > Verse navigation:

Old/New Testament tabs
Book list with chapter counts
Chapter grid selection
[NEW] 
ChapterView.tsx
Full chapter reading view:

Continuous scroll through chapter
Previous/Next chapter navigation
Remembers last read position (localStorage)
Swipe navigation on mobile
[NEW] 
SearchView.tsx
Bible search functionality:

Reference search (e.g., "John 3:16")
Free text search through verses
Results with context preview
[NEW] 
CalendarView.tsx
Date picker for navigating to any liturgical day:

Monthly calendar grid
Highlights Sundays and feast days
Shows reading preview on selection
PWA Infrastructure
[NEW] 
manifest.json
PWA manifest with app name, icons, theme colors, standalone display mode.

[NEW] 
sw.js
Service worker for offline support:

Cache-first strategy for static assets
Network-first for API data
Background sync for Bible hydration
[NEW] 
useOfflineData.ts
React hook for IndexedDB operations:

Initialize database with Bible schema
Background hydration of full Bible
Query verses by UVID or reference
[NEW] 
db.ts
IndexedDB utilities using idb library (or custom wrapper):

getVerse(ref: string) / getVerseByUVID(uvid: number)
getChapter(book: string, chapter: number)
searchVerses(query: string)
hydrateDatabase(data: Verse[])
Styling
[NEW] 
rcl.css
RCL-specific styles:

Serif typography (Lora) for reading
High-contrast light/dark themes
Smooth transitions
Mobile-first responsive layout
[MODIFY] 
tailwind.config.cjs
Add RCL color palette and font configuration:

rcl: {
  cream: '#FAF8F5',   // Light mode background
  ink: '#1A1A1A',     // Dark text
  night: '#0D0D0D',   // Dark mode background
  parchment: '#F5F1EB',
}
Utilities
[NEW] 
lectionary.ts
Lectionary calculation utilities:

getRCLYear(date) - Returns A, B, or C
getLectionaryWeek(date) - Returns liturgical week
getReadingsForDate(date) - Returns day's readings
[NEW] 
references.ts
Bible reference parsing:

Parse "John 3:16" → { book: "JHN", chapter: 3, verse: 16 }
Generate UVID from reference
Format references for display
Verification Plan
Browser Testing (Primary)
Since this is a client-side React app, verification will primarily use browser testing:

Launch dev server:

cd /Users/jfhome/Desktop/congenial-broccoli && npm run dev
Navigate to /rcl and verify:

 Today's readings display correctly for current date
 Liturgical year calculation shows "Year A" for 2026
 All 4 reading sections render (First, Psalm, Second, Gospel)
Test swipe navigation:

 Swipe left → tomorrow's readings appear
 Swipe right → yesterday's readings appear
 Date header updates correctly
Test sidebar navigation:

 Hamburger menu opens sidebar on mobile
 "Bible" link opens book browser
 "Search" link opens search view
 "Calendar" opens date picker
Test Bible reading:

 Select book → chapter → verses display
 Scroll through chapter works
 Next/Previous chapter buttons work
Test dark mode:

 Toggle in sidebar switches theme
 Theme persists on reload
Test mobile viewport (Chrome DevTools → responsive mode):

 Layout adapts correctly
 Sidebar slides in/out
 Touch gestures work
Manual User Testing
Since PWA offline features require user verification:

NOTE

After I complete implementation, please test the following on your device:

Visit /rcl and let it load fully
Check offline indicator appears (green checkmark in sidebar)
Turn off network (airplane mode) and reload - app should work
Install to home screen (if prompted) and verify standalone mode
Implementation Phases
Phase 1 (Core): Layout, TodayView, ReadingCard, basic navigation
Phase 2 (Bible): BibleBrowser, ChapterView, reading progress
Phase 3 (Features): Search, Calendar, cross-references
Phase 4 (PWA): Service worker, IndexedDB hydration, offline support