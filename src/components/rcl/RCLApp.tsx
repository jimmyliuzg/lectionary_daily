import React, { useState, useEffect, useRef } from 'react';
import { TodayView } from './TodayView';
import { RCLSidebar } from './RCLSidebar';
import { BibleBrowser } from './BibleBrowser';
import { ChapterView } from './ChapterView';
import { SearchView } from './SearchView';
import { CalendarView } from './CalendarView';
import { isHydrated, hydrateBible } from '../../lib/rcl/db';
import { loadBibleData, loadStructuredData } from '../../lib/rcl/bibleData';
import { parseReference } from './lib/references';

type View = 'today' | 'bible' | 'chapter-view' | 'search' | 'calendar';
export type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export function RCLApp() {
  const [currentView, setCurrentView] = useState<View>('today');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('large');
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [menuVisible, setMenuVisible] = useState(true);
  const lastScrollY = useRef(0);

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

    // Initialize font size
    const savedFontSize = localStorage.getItem('rcl-font-size') as FontSize;
    if (savedFontSize && ['small', 'medium', 'large', 'xlarge'].includes(savedFontSize)) {
      setFontSize(savedFontSize);
      document.body.classList.add(`text-size-${savedFontSize}`);
    } else {
      document.body.classList.add('text-size-large');
    }

    // Check offline readiness
    const checkHydration = async () => {
      const hydrated = await isHydrated();
      setIsOfflineReady(hydrated);

      if (!hydrated) {
        // Start hydration in background (lazy-loads the ~12MB Bible chunks)
        const [bibleData, bibleStructured] = await Promise.all([
          loadBibleData(),
          loadStructuredData(),
        ]);
        await hydrateBible(bibleData, bibleStructured);
        setIsOfflineReady(true);
        localStorage.setItem('rcl-offline-ready', 'true');
      }
    };

    checkHydration();

    // Scroll listener to hide/show the hamburger menu button
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY.current;
      const atTop = currentScrollY < 50;

      if (atTop) {
        setMenuVisible(true);
      } else if (scrollingDown && currentScrollY > 100) {
        setMenuVisible(false);
      } else if (!scrollingDown) {
        setMenuVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

  const changeFontSize = (newSize: FontSize) => {
    document.body.classList.remove(`text-size-${fontSize}`);
    document.body.classList.add(`text-size-${newSize}`);
    setFontSize(newSize);
    localStorage.setItem('rcl-font-size', newSize);
  };

  const handleReferenceClick = (ref: string) => {
    // Parse "John 3:16-18", "Genesis 1:1", etc. and jump to the chapter
    const parsed = parseReference(ref);
    if (parsed) {
      handleBibleNavigate(parsed.bookId, parsed.chapter);
    } else {
      // Fallback to plain bible view
      setCurrentView('bible');
    }
  };

  // Sidebar navigation: "Today's Lectionary" always returns to the real
  // today, not the last browsed date (e.g. one picked in the calendar).
  const handleViewChange = (view: View) => {
    if (view === 'today') {
      setCurrentDate(new Date());
    }
    setCurrentView(view);
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
          offlineReady={isOfflineReady}
        />;
      case 'bible':
        return (
          <BibleBrowser
            onNavigate={handleBibleNavigate}
            initialBookId={selectedBookId}
          />
        );
      case 'chapter-view':
        return (
          <ChapterView
            bookId={selectedBookId}
            chapter={selectedChapter}
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
          offlineReady={isOfflineReady}
        />;
    }
  };

  // Touch handlers for swipe to open sidebar
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only respond to touches starting from left edge (first 20px)
    if (e.touches[0].clientX < 20) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
      // If swiping right from left edge, prevent default scroll
      if (touchDeltaX.current > 10) {
        // Could prevent scroll here if needed
      }
    }
  };

  const handleTouchEnd = () => {
    // If swiped more than 50px from left edge, open sidebar
    if (touchStartX.current !== null && touchDeltaX.current > 50) {
      setSidebarOpen(true);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  return (
    <div 
      className="rcl-app"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe hint indicator - shows when near left edge */}
      <div className="swipe-edge-hint" />

      {/* Hamburger menu button */}
      <button
        className={`menu-btn ${menuVisible ? '' : 'menu-btn-hidden'} ${sidebarOpen ? 'menu-btn-active' : ''}`}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Sidebar */}
      <RCLSidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isDark={isDark}
        onToggleDark={toggleDarkMode}
        fontSize={fontSize}
        onChangeFontSize={changeFontSize}
        isOfflineReady={isOfflineReady}
      />

      {/* Main content */}
      <div className={`rcl-main ${sidebarOpen ? 'rcl-main-shifted' : ''}`}>
        {renderView()}
      </div>

      {/* Click outside to close */}
      {sidebarOpen && (
        <div 
          className="sidebar-closer" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <style>{`
        .rcl-app {
          min-height: 100vh;
          display: flex;
          position: relative;
        }

        .swipe-edge-hint {
          position: fixed;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: transparent;
          z-index: 5;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .rcl-app:active .swipe-edge-hint {
          opacity: 1;
          background: var(--rcl-secondary);
          opacity: 0.3;
        }
        
        .menu-btn {
          position: fixed;
          top: 0.75rem;
          left: 0.75rem;
          z-index: 60;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: none;
          background: color-mix(in srgb, var(--rcl-bg) 85%, transparent);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: var(--rcl-text);
          cursor: pointer;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .menu-btn:hover {
          background: color-mix(in srgb, var(--rcl-bg) 95%, transparent);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          transform: scale(1.02);
        }

        .menu-btn:active {
          transform: scale(0.96);
        }

        .menu-btn-hidden {
          opacity: 0;
          transform: translateY(-100%);
          pointer-events: none;
        }

        .menu-btn-active {
          background: color-mix(in srgb, var(--rcl-secondary) 15%, transparent);
        }
        
        .menu-btn svg {
          width: 24px;
          height: 24px;
          transition: transform 0.25s ease;
        }

        .sidebar-closer {
          position: fixed;
          inset: 0;
          z-index: 35;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(2px);
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .rcl-main {
          flex: 1;
          min-height: 100vh;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .rcl-main-shifted {
          transform: translateX(280px);
        }

        @media (max-width: 480px) {
          .rcl-main-shifted {
            transform: translateX(0);
          }

          .menu-btn {
            top: 0.5rem;
            left: 0.5rem;
            width: 44px;
            height: 44px;
          }
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default RCLApp;
