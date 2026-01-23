import React, { useState, useRef, useEffect } from 'react';
import { ScriptureRenderer } from './ScriptureRenderer';
import {
    getReadingsForDate,
    formatDisplayDate,
    formatDateKey,
    type DayReading
} from './lib/lectionary';

interface TodayViewProps {
    onReferenceClick?: (ref: string) => void;
}

export function TodayView({ onReferenceClick }: TodayViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [readings, setReadings] = useState<DayReading | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    // Load readings for current date
    useEffect(() => {
        const dayReadings = getReadingsForDate(currentDate);
        setReadings(dayReadings);
    }, [currentDate]);

    // Navigate to previous day
    const goToPrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    // Navigate to next day
    const goToNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    // Touch handlers for swipe navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;

        if (diff > threshold) {
            // Swiped left - go to next day
            goToNextDay();
        } else if (diff < -threshold) {
            // Swiped right - go to previous day
            goToPrevDay();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPrevDay();
            } else if (e.key === 'ArrowRight') {
                goToNextDay();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentDate]);

    const isToday = formatDateKey(currentDate) === formatDateKey(new Date());

    return (
        <div
            ref={containerRef}
            className="today-view"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Date Header */}
            <header className="today-header">
                <button
                    className="nav-btn prev-btn"
                    onClick={goToPrevDay}
                    aria-label="Previous day"
                >
                    <ChevronLeft />
                </button>

                <div className="date-info">
                    {isToday && <span className="today-badge">Today</span>}
                    <h1 className="display-date">{formatDisplayDate(currentDate)}</h1>
                    {readings?.dayName && (
                        <h2 className="liturgical-day">{readings.dayName}</h2>
                    )}
                </div>

                <button
                    className="nav-btn next-btn"
                    onClick={goToNextDay}
                    aria-label="Next day"
                >
                    <ChevronRight />
                </button>
            </header>

            {/* Readings */}
            <main className="readings-container">
                {readings && readings.readings.length > 0 ? (
                    readings.readings.map((reading, index) => (
                        <ScriptureRenderer
                            key={`${reading.type}-${index}`}
                            type={reading.type}
                            reference={reading.reference}
                            onReferenceClick={onReferenceClick}
                        />
                    ))
                ) : (
                    <div className="no-readings">
                        <p>No readings available for this date.</p>
                        <p className="hint">Try navigating to a different day using the arrows or swiping.</p>
                    </div>
                )}
            </main>

            {/* Swipe hint for mobile */}
            <div className="swipe-hint">
                <span>← Swipe to navigate →</span>
            </div>

            <style>{`
        .today-view {
          min-height: 100vh;
          padding: 1rem;
          max-width: 48rem;
          margin: 0 auto;
        }
        
        .today-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 0 2rem;
          position: sticky;
          top: 0;
          background: inherit;
          z-index: 10;
        }
        
        .date-info {
          text-align: center;
          flex: 1;
        }
        
        .today-badge {
          display: inline-block;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #FFFFFF;
          background: #B8860B;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .display-date {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: var(--text-primary, #1A1A1A);
        }
        
        .liturgical-day {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--text-secondary, #666666);
          margin: 0.25rem 0 0;
        }
        
        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: none;
          background: transparent;
          color: var(--text-primary, #1A1A1A);
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.2s ease;
        }
        
        .nav-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        
        .nav-btn:active {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .nav-btn svg {
          width: 24px;
          height: 24px;
        }
        
        .readings-container {
          padding-bottom: 4rem;
        }
        
        .no-readings {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary, #666666);
        }
        
        .no-readings p {
          margin: 0.5rem 0;
        }
        
        .hint {
          font-size: 0.875rem;
          opacity: 0.7;
        }
        
        .swipe-hint {
          position: fixed;
          bottom: 1rem;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.75rem;
          color: var(--text-secondary, #999999);
          opacity: 0.6;
          pointer-events: none;
        }
        
        @media (min-width: 768px) {
          .today-view {
            padding: 2rem;
          }
          
          .display-date {
            font-size: 1.5rem;
          }
          
          .swipe-hint {
            display: none;
          }
        }
        
        /* Dark mode */
        .dark .today-badge {
          background: #DAA520;
          color: #0D0D0D;
        }
        
        .dark .display-date {
          color: #E8E8E8;
        }
        
        .dark .liturgical-day {
          color: #999999;
        }
        
        .dark .nav-btn {
          color: #E8E8E8;
        }
        
        .dark .nav-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .dark .nav-btn:active {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
        </div>
    );
}

// Chevron icons
function ChevronLeft() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

export default TodayView;
