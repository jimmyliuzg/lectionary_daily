import React from 'react';

type View = 'today' | 'bible' | 'chapter-view' | 'search' | 'calendar';

interface RCLSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  isOfflineReady?: boolean;
}

export function RCLSidebar({
  currentView,
  onViewChange,
  isOpen,
  onClose,
  isDark,
  onToggleDark,
  isOfflineReady = false,
}: RCLSidebarProps) {
  const handleNavClick = (view: View) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`rcl-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <header className="sidebar-header">
          <h1 className="app-title">RCL Daily</h1>
          {isOfflineReady && (
            <span className="offline-indicator" title="Available offline">
              <CheckCircle />
            </span>
          )}
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            <XIcon />
          </button>
        </header>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentView === 'today' ? 'active' : ''}`}
            onClick={() => handleNavClick('today')}
          >
            <SunIcon />
            <span>Today's Lectionary</span>
          </button>

          <button
            className={`nav-item ${currentView === 'search' ? 'active' : ''}`}
            onClick={() => handleNavClick('search')}
          >
            <SearchIcon />
            <span>Search</span>
          </button>

          <button
            className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={() => handleNavClick('calendar')}
          >
            <CalendarIcon />
            <span>Calendar</span>
          </button>

          <button
            className={`nav-item ${currentView === 'bible' ? 'active' : ''}`}
            onClick={() => handleNavClick('bible')}
          >
            <BookIcon />
            <span>Full Bible</span>
          </button>
        </nav>

        {/* Settings */}
        <div className="sidebar-settings">
          <button
            className="settings-item"
            onClick={onToggleDark}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        {/* Footer */}
        <footer className="sidebar-footer">
          <p>Berean Standard Bible</p>
          <p className="copyright">Public Domain</p>
        </footer>

        <style>{`
          .sidebar-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 40;
          }
          
          .rcl-sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px;
            background: var(--sidebar-bg, #FFFFFF);
            border-right: 1px solid var(--border-color, rgba(0,0,0,0.1));
            z-index: 50;
            display: flex;
            flex-direction: column;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          
          .rcl-sidebar.open {
            transform: translateX(0);
          }
          
          .sidebar-header {
            display: flex;
            align-items: center;
            padding: 1.5rem 1rem;
            border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1));
          }
          
          .app-title {
            font-family: 'Lora', Georgia, serif;
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary, #1A1A1A);
            margin: 0;
            flex: 1;
          }
          
          .offline-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #22C55E;
            margin-right: 0.5rem;
          }
          
          .offline-indicator svg {
            width: 20px;
            height: 20px;
          }
          
          .close-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border: none;
            background: transparent;
            color: var(--text-primary, #1A1A1A);
            cursor: pointer;
            border-radius: 50%;
          }
          
          .close-btn:hover {
            background: rgba(0, 0, 0, 0.05);
          }
          
          .close-btn svg {
            width: 20px;
            height: 20px;
          }
          
          .sidebar-nav {
            flex: 1;
            padding: 1rem 0;
          }
          
          .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.875rem 1.25rem;
            border: none;
            background: transparent;
            color: var(--text-primary, #1A1A1A);
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 0.9375rem;
            text-align: left;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          
          .nav-item:hover {
            background: rgba(0, 0, 0, 0.05);
          }
          
          .nav-item.active {
            background: rgba(184, 134, 11, 0.1);
            color: #B8860B;
            font-weight: 500;
          }
          
          .nav-item svg {
            width: 20px;
            height: 20px;
            opacity: 0.7;
          }
          
          .nav-item.active svg {
            opacity: 1;
          }
          
          .sidebar-settings {
            padding: 0.5rem 0;
            border-top: 1px solid var(--border-color, rgba(0,0,0,0.1));
          }
          
          .settings-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            width: 100%;
            padding: 0.875rem 1.25rem;
            border: none;
            background: transparent;
            color: var(--text-secondary, #666666);
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 0.875rem;
            text-align: left;
            cursor: pointer;
          }
          
          .settings-item:hover {
            background: rgba(0, 0, 0, 0.05);
          }
          
          .settings-item svg {
            width: 18px;
            height: 18px;
            opacity: 0.7;
          }
          
          .sidebar-footer {
            padding: 1rem 1.25rem;
            border-top: 1px solid var(--border-color, rgba(0,0,0,0.1));
          }
          
          .sidebar-footer p {
            font-family: 'Inter', system-ui, sans-serif;
            font-size: 0.75rem;
            color: var(--text-secondary, #999999);
            margin: 0;
          }
          
          .copyright {
            margin-top: 0.25rem !important;
            opacity: 0.7;
          }
          
          /* Desktop */
          @media (min-width: 768px) {
            .sidebar-overlay {
              display: none;
            }
            
            .rcl-sidebar {
              transform: translateX(0);
            }
            
            .close-btn {
              display: none;
            }
          }
          
          /* Dark mode */
          .dark .rcl-sidebar {
            background: #0D0D0D;
            border-right-color: rgba(255,255,255,0.1);
          }
          
          .dark .sidebar-header {
            border-bottom-color: rgba(255,255,255,0.1);
          }
          
          .dark .app-title {
            color: #E8E8E8;
          }
          
          .dark .close-btn {
            color: #E8E8E8;
          }
          
          .dark .close-btn:hover {
            background: rgba(255,255,255,0.1);
          }
          
          .dark .nav-item {
            color: #E8E8E8;
          }
          
          .dark .nav-item:hover {
            background: rgba(255,255,255,0.1);
          }
          
          .dark .nav-item.active {
            background: rgba(218, 165, 32, 0.15);
            color: #DAA520;
          }
          
          .dark .sidebar-settings {
            border-top-color: rgba(255,255,255,0.1);
          }
          
          .dark .settings-item {
            color: #999999;
          }
          
          .dark .settings-item:hover {
            background: rgba(255,255,255,0.1);
          }
          
          .dark .sidebar-footer {
            border-top-color: rgba(255,255,255,0.1);
          }
        `}</style>
      </aside>
    </>
  );
}

// Icons
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default RCLSidebar;
