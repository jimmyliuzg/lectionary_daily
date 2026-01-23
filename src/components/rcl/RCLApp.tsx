import React, { useState, useEffect } from 'react';
import { TodayView } from './TodayView';
import { RCLSidebar } from './RCLSidebar';
import { BibleBrowser } from './BibleBrowser';
import { ChapterView } from './ChapterView';
import { SearchView } from './SearchView';
import { CalendarView } from './CalendarView';
import { isHydrated, hydrateBible } from '../../lib/rcl/db';
import bibleData from '../../data/bible-bsb.json';

type View = 'today' | 'bible' | 'chapter-view' | 'search' | 'calendar';

export function RCLApp() {
  const [currentView, setCurrentView] = useState<View>('today');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(false);

  // Bible Navigation State
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('rcl-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.body.classList.add('dark');
    } else if (savedTheme === 'light') {
      setIsDark(false);
      document.body.classList.remove('dark');
    } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
      document.body.classList.add('dark');
    }

    // Check offline readiness
    const checkHydration = async () => {
      const hydrated = await isHydrated();
      setIsOfflineReady(hydrated);

      if (!hydrated) {
        // Start hydration in background
        // @ts-ignore
        hydrateBible(bibleData as any).then(() => {
          setIsOfflineReady(true);
          localStorage.setItem('rcl-offline-ready', 'true');
        });
      }
    };

    checkHydration();
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);

    if (newDark) {
      document.body.classList.add('dark');
      localStorage.setItem('rcl-theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('rcl-theme', 'light');
    }
  };

  const handleReferenceClick = (ref: string) => {
    // Parse reference (simple implementation for now)
    // Expected format: Book.Chapter.Verse or "Book Chapter:Verse"
    // For now, let's just log it. Real parsing needed later.
    console.log('Navigate to reference:', ref);

    // Example: JHN.3.16 -> Book: JHN, Chapter: 3
    const parts = ref.split('.');
    if (parts.length >= 2) {
      const book = parts[0];
      const chapter = parseInt(parts[1], 10);
      handleBibleNavigate(book, chapter);
    } else {
      // Fallback to plain bible view
      setCurrentView('bible');
    }
  };

  const handleBibleNavigate = (bookId: string, chapter: number) => {
    setSelectedBookId(bookId);
    setSelectedChapter(chapter);
    setCurrentView('chapter-view');
  };

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView
          onReferenceClick={handleReferenceClick}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />;
      case 'bible':
        return (
          // @ts-ignore - casting for dev time flexibility with imported json
          <BibleBrowser
            onNavigate={handleBibleNavigate}
            bibleData={bibleData as any}
            initialBookId={selectedBookId}
          />
        );
      case 'chapter-view':
        return (
          // @ts-ignore
          <ChapterView
            bookId={selectedBookId}
            chapter={selectedChapter}
            bibleData={bibleData as any}
            onNavigate={handleBibleNavigate}
            onBack={() => setCurrentView('bible')}
          />
        );
      case 'search':
        return <SearchView onNavigate={handleBibleNavigate} />;
      case 'calendar':
        return <CalendarView onDateSelect={(date) => {
          setCurrentDate(date);
          setCurrentView('today');
        }} />;
      default:
        return <TodayView
          onReferenceClick={handleReferenceClick}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />;
    }
  };

  return (
    <div className="rcl-app">
      {/* Hamburger menu button (mobile) */}
      <button
        className="menu-btn"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <MenuIcon />
      </button>

      {/* Sidebar */}
      <RCLSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        isOfflineReady={isOfflineReady}
      />

      {/* Main content */}
      <div className="rcl-main">
        {renderView()}
      </div>

      <style>{`
        .rcl-app {
          min-height: 100vh;
          display: flex;
        }
        
        .menu-btn {
          position: fixed;
          top: 1rem;
          left: 1rem;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 85%);
          background: var(--rcl-bg);
          color: var(--rcl-text);
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }
        
        .menu-btn:hover {
          background: color-mix(in srgb, var(--rcl-primary), transparent 92%);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        .menu-btn svg {
          width: 24px;
          height: 24px;
        }
        
        .rcl-main {
          flex: 1;
          min-height: 100vh;
        }
        
        @media (min-width: 768px) {
          .rcl-main {
            /* Full width even on desktop, sidebar is now an overlay */
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Placeholder view for features coming in later phases
function PlaceholderView({ title, description }: { title: string; description: string }) {
  return (
    <div className="placeholder-view">
      <div className="placeholder-content">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      <style>{`
        .placeholder-view {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        
        .placeholder-content {
          text-align: center;
          max-width: 400px;
        }
        
        .placeholder-content h1 {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 2rem;
          font-weight: 500;
          color: var(--text-primary, #1A1A1A);
          margin: 0 0 1rem;
        }
        
        .placeholder-content p {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 1rem;
          color: var(--text-secondary, #666666);
          margin: 0;
        }
        
        .dark .placeholder-content h1 {
          color: #E8E8E8;
        }
        
        .dark .placeholder-content p {
          color: #999999;
        }
      `}</style>
    </div>
  );
}

// Menu icon
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export default RCLApp;
