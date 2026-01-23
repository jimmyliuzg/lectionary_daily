RCL Daily PWA - Task Checklist
Planning Phase
 Explore existing codebase structure
 Research BSB Bible data sources
 Create implementation plan
 Get user approval on implementation plan (streamlined approach approved)
Phase 1: Core Reading Functionality ✅
Core Files & Structure
 Create 
RCLLayout.astro
 (standalone layout for /rcl)
 Create 
/rcl/index.astro
 (main entry point)
 Setup PWA manifest
React Components
 
RCLApp.tsx
 - Main app container with view routing
 
TodayView.tsx
 - Today's readings with swipe/arrow navigation
 
ScriptureRenderer.tsx
 - Unified scripture display (consolidated)
 
RCLSidebar.tsx
 - Navigation sidebar with dark mode toggle
Data & Utilities
 
lectionary-2026.json
 - Sample RCL Year A data
 
references.ts
 - Bible reference parsing utilities
 
lectionary.ts
 - Lectionary calculation utilities
Styling
 Tailwind config with RCL palette and Lora serif font
 Dark mode support
 Mobile-first responsive design
Phase 2: Full Bible (Next)
 BibleBrowser.tsx - Book > Chapter > Verse navigation
 ChapterView.tsx - Chapter reading with infinite scroll
 Download/prepare BSB Bible JSON data
 Intersection Observers for chapter loading
Phase 3: Features
 SearchView.tsx - Bible search functionality
 CalendarView.tsx - Date picker for lectionary navigation
 Cross-reference linking
Phase 4: PWA/Offline
 Service Worker (with database-in-worker hydration)
 IndexedDB setup for Bible storage
 Background hydration logic
 Offline status indicator