import React, { useState, useRef, useEffect } from 'react';
import { ScriptureRenderer } from './ScriptureRenderer';
import {
  getReadingsForDate,
  formatDisplayDate,
  formatDateKey,
  type DayReading
} from './lib/lectionary';
import { getVersesByParsedReference, type Verse } from '../../lib/rcl/db';
import { parseReference } from './lib/references';

interface TodayViewProps {
  onReferenceClick?: (ref: string) => void;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function TodayView({ onReferenceClick, currentDate, onDateChange }: TodayViewProps) {
  const [readings, setReadings] = useState<DayReading | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const [readingVerses, setReadingVerses] = useState<Record<string, Verse[]>>({});
  const [isLoadingReadings, setIsLoadingReadings] = useState(true);

  // Load readings and their verses for current date
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingReadings(true);
      const dayReadings = getReadingsForDate(currentDate);
      setReadings(dayReadings);

      if (dayReadings) {
        const versesMap: Record<string, Verse[]> = {};

        await Promise.all(dayReadings.readings.map(async (reading) => {
          const parsed = parseReference(reading.reference);
          if (parsed) {
            try {
              const verses = await getVersesByParsedReference(parsed);
              versesMap[reading.reference] = verses;
            } catch (e) {
              console.error(`Failed to load verses for ${reading.reference}:`, e);
            }
          }
        }));

        setReadingVerses(versesMap);
      }
      setIsLoadingReadings(false);
    };

    loadData();
  }, [currentDate]);

  // Navigate to previous day
  const goToPrevDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  // Navigate to next day
  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
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
        {isLoadingReadings ? (
          <div className="loading-state">
            <div className="skeleton-reading"></div>
            <div className="skeleton-reading"></div>
            <div className="skeleton-reading"></div>
          </div>
        ) : readings && readings.readings.length > 0 ? (
          readings.readings.map((reading, index) => (
            <ScriptureRenderer
              key={`${reading.type}-${index}`}
              type={reading.type}
              reference={reading.reference}
              verses={readingVerses[reading.reference]}
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
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--rcl-secondary);
          background: color-mix(in srgb, var(--rcl-secondary), transparent 85%);
          border: 1px solid color-mix(in srgb, var(--rcl-secondary), transparent 80%);
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .display-date {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 500;
          margin: 0;
          color: var(--rcl-text);
        }
        
        .liturgical-day {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--rcl-text);
          opacity: 0.7;
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
          color: var(--rcl-text);
          cursor: pointer;
          border-radius: 50%;
          transition: background 0.2s ease;
        }
        
        .nav-btn:hover {
          background: color-mix(in srgb, var(--rcl-secondary), transparent 85%);
          opacity: 1;
        }
        
        .nav-btn:active {
          background: color-mix(in srgb, var(--rcl-secondary), transparent 70%);
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
          color: var(--rcl-text);
          opacity: 0.6;
        }
        
        .no-readings p {
          margin: 0.5rem 0;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 1rem 0;
        }

        .skeleton-reading {
          height: 200px;
          background: var(--rcl-primary);
          opacity: 0.1;
          border-radius: 12px;
          animation: pulse 1.5s infinite ease-in-out;
        }

        @keyframes pulse {
          0% { opacity: 0.05; }
          50% { opacity: 0.15; }
          100% { opacity: 0.05; }
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
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 0.75rem;
          color: var(--rcl-text);
          opacity: 0.4;
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
