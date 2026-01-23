# RCL Daily: Technical Architecture

RCL Daily is designed as a high-performance, offline-first Progressive Web App (PWA) built with **Astro**, **React**, and **IndexedDB**. Its primary goal is to provide a minimalist, distraction-free interface for liturgical reading while ensuring 100% functionality regardless of internet connectivity.

---

## 🏗 High-Level Stack

- **Framework**: [Astro](https://astro.build) (Hosting a Client-Side React SPA)
- **UI Library**: [React 19](https://react.dev)
- **Styling**: Vanilla CSS (Scoped to components)
- **Database**: [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) (via the `idb` library)
- **Offline Infrastructure**: Service Workers & PWA Manifest
- **Language**: TypeScript

---

## 📊 Data Architecture

The application handles two distinct categories of data:

### 1. The Bible Corpus (BSB)
The Berean Standard Bible (Public Domain) consists of approximately **31,102 verses** across 66 books.
- **Source**: CSV format.
- **Pipeline**: A Node.js script (`scripts/process-bible.js`) processes the CSV into a flattened JSON structure.
- **Hydration**: On the first app load, the client executes a background hydration process. This reads the 6.5MB JSON file once and populates an IndexedDB store keyed by `uvid` and indexed by `ref` (Book.Chapter.Verse).
- **Querying**: Subsequent reads (e.g., opening a chapter) bypass the JSON file and query IndexedDB directly, achieving **sub-10ms** load times.

### 2. The Lectionary (RCL Year A)
Contains the specific readings for each day of the liturgical year 2026.
- **Source**: Static JSON (`src/data/rcl/lectionary-2026.json`).
- **Logic**: Navigation utilities (`src/components/rcl/lib/lectionary.ts`) handle liturgical date calculations, seasonal changes, and day-to-day navigation.

---

## 🛠 Component Architecture

The app follows a Single Page Application (SPA) pattern within a single Astro route (`/rcl/`).

### View Management (`RCLApp.tsx`)
The root component acts as a central coordinator, managing:
- **Global States**: Theme (Dark/Light), Current Date (for lectionary tracking), and Active View.
- **View Router**: A switch-case renderer for:
  - `TodayView`: The primary liturgical dashboard.
  - `BibleBrowser`: Hierarchical Book/Chapter navigation.
  - `SearchView`: Keyword and reference-based discovery.
  - `CalendarView`: Non-linear date exploration.
  - `ChapterView`: Immersive full-chapter reading experience.

### Shared Logic & Utilities
- **`references.ts`**: A regex-driven engine that parses strings like "John 3:16" into structured objects.
- **`ScriptureRenderer.tsx`**: A unified layout component for all scripture text, featuring automatic cross-reference detection and link generation.

---

## 🔌 Progressive Web App (PWA) Features

### Service Worker (`sw.js`)
The application uses a custom service worker to implement:
- **Asset Caching**: Pre-caches critical UI assets (Inter/Lora fonts, SVG icons, manifests).
- **Cache-First Strategy**: Prioritizes local cache for static files to ensure instant startups.
- **Offline App Shell**: Ensures the UI loads even in Airplane Mode.

### IndexedDB Hydration
Because the Bible JSON is too large to load on every interaction without performance degradation, the app uses **IndexedDB** as its primary data engine. This allows the app to perform full-text searches and random-access chapter loading without keeping the entire Bible in memory.

---

## 🎨 Styling System

The app utilizes a strictly defined set of CSS variables for a "premium" aesthetic:
- **Typography**: `Lora` (Serif) for scripture text for readability; `Inter` (Sans-serif) for UI controls.
- **Theming**: A dual-theme system controlled via a `.dark` class on the `<body>`.
- **Motion**: Subtle CSS transitions (300ms) for sidebar state and view changes to mimic a native OS feel.
