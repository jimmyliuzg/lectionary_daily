import React, { useState, useEffect } from 'react';
import { TodayView } from './TodayView';
import { RCLSidebar } from './RCLSidebar';

type View = 'today' | 'bible' | 'search' | 'calendar';

export function RCLApp() {
    const [currentView, setCurrentView] = useState<View>('today');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [isOfflineReady, setIsOfflineReady] = useState(false);

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
        const offlineStatus = localStorage.getItem('rcl-offline-ready');
        setIsOfflineReady(offlineStatus === 'true');
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
        // Navigate to Bible view and load reference
        console.log('Navigate to reference:', ref);
        setCurrentView('bible');
        // TODO: Pass reference to BibleBrowser
    };

    const renderView = () => {
        switch (currentView) {
            case 'today':
                return <TodayView onReferenceClick={handleReferenceClick} />;
            case 'bible':
                return <PlaceholderView title="Bible Browser" description="Full Bible navigation coming in Phase 2" />;
            case 'search':
                return <PlaceholderView title="Search" description="Bible search coming in Phase 3" />;
            case 'calendar':
                return <PlaceholderView title="Calendar" description="Calendar picker coming in Phase 3" />;
            default:
                return <TodayView onReferenceClick={handleReferenceClick} />;
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
          border: none;
          background: var(--sidebar-bg, #FFFFFF);
          color: var(--text-primary, #1A1A1A);
          cursor: pointer;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.2s ease;
        }
        
        .menu-btn:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
          .menu-btn {
            display: none;
          }
          
          .rcl-main {
            margin-left: 280px;
          }
        }
        
        /* Dark mode */
        .dark .menu-btn {
          background: #1A1A1A;
          color: #E8E8E8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
        
        .dark .menu-btn:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
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
          font-family: 'Lora', Georgia, serif;
          font-size: 2rem;
          font-weight: 500;
          color: var(--text-primary, #1A1A1A);
          margin: 0 0 1rem;
        }
        
        .placeholder-content p {
          font-family: 'Inter', system-ui, sans-serif;
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
