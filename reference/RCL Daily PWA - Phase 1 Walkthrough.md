RCL Daily PWA - Phase 1 Walkthrough
Phase 1 core functionality is complete. The app is accessible at /rcl on the website.

What Was Built
Today's Lectionary View
The primary landing page displays the current day's readings with:

Date header with "Today" badge
Liturgical day name (e.g., "Thursday after Epiphany 1")
Scripture readings (Psalm, Old Testament, New Testament for weekdays; First Reading, Psalm, Second Reading, Gospel for Sundays)
Desktop view with sidebar and today's readings
Review
Desktop view with sidebar and today's readings

Navigation
Arrow buttons for previous/next day
Keyboard arrows (← →) for navigation
Swipe gestures on mobile (touch start/end detection)
Sidebar
Today's Lectionary (current view)
Search (Phase 3)
Calendar (Phase 3)
Full Bible (Phase 2)
Dark mode toggle
Responsive Design
Mobile layout with hamburger menu:

Mobile view with sidebar open
Review
Mobile view with sidebar open

Dark Mode
Toggle in sidebar immediately switches theme:

Dark mode view
Review
Dark mode view

Files Created
File	Purpose
RCLLayout.astro
Standalone layout with Lora font & PWA meta
rcl/index.astro
Entry point mounting React app
RCLApp.tsx
Main container with view routing
TodayView.tsx
Today's readings with swipe navigation
ScriptureRenderer.tsx
Unified scripture display
RCLSidebar.tsx
Navigation sidebar
lectionary.ts
RCL year calculation & date utilities
references.ts
Bible reference parsing
lectionary-2026.json
Sample RCL Year A data
rcl-manifest.json
PWA manifest
Demo Recording
RCL Daily app demo
Review
RCL Daily app demo

Next Steps (Phase 2)
Full Bible browser with Book > Chapter navigation
BSB Bible data download and integration
Infinite scroll with Intersection Observers