import React, { useState, useMemo } from 'react';
import { formatDateKey, formatDisplayDate, getLiturgicalInfo } from './lib/lectionary';

interface CalendarViewProps {
  onDateSelect: (date: Date) => void;
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const days = [];

    // Add padding for start of month
    const firstDayWeekday = firstDayOfMonth.getDay(); // 0 is Sunday
    for (let i = 0; i < firstDayWeekday; i++) {
      const d = new Date(year, month, 1 - (firstDayWeekday - i));
      days.push({ date: d, currentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(year, month, i), currentMonth: true });
    }

    // Add padding for end of month to complete the 6x7 grid (optional but looks better)
    while (days.length < 42) {
      const d: Date = new Date(year, month + 1, days.length - lastDayOfMonth.getDate() - firstDayWeekday + 1);
      days.push({ date: d, currentMonth: false });
    }

    return days;
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const isToday = (date: Date) => {
    return formatDateKey(date) === formatDateKey(new Date());
  };

  const liturgicalColor = (date: Date) => {
    return getLiturgicalInfo(date).color;
  };

  const seasonLabel = (date: Date) => {
    return getLiturgicalInfo(date).label;
  };

  return (
    <div className="calendar-view">
      <header className="calendar-header">
        <h1>Liturgical Calendar</h1>
        <div className="calendar-nav">
          <button onClick={handlePrevMonth} className="nav-btn">
            <ChevronLeft />
          </button>
          <h2>{monthName} {year}</h2>
          <button onClick={handleNextMonth} className="nav-btn">
            <ChevronRight />
          </button>
        </div>
      </header>

      <div className="calendar-grid-container">
        <div className="weekday-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="weekday">{d}</div>
          ))}
        </div>
        <div className="calendar-grid">
          {daysInMonth.map(({ date, currentMonth }, i) => (
            <button
              key={i}
              className={`calendar-day ${currentMonth ? '' : 'other-month'} ${isToday(date) ? 'today' : ''}`}
              onClick={() => onDateSelect(date)}
              aria-label={`${formatDisplayDate(date)} — ${seasonLabel(date)}`}
            >
              <span className="day-number">{date.getDate()}</span>
              <span
                className="liturgical-dot"
                style={{ backgroundColor: liturgicalColor(date) }}
                title={seasonLabel(date)}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="calendar-info">
        <p>Select a date to see its lectionary readings.</p>
        <button className="jump-today-btn" onClick={() => onDateSelect(new Date())}>
          Jump to Today
        </button>
      </div>

      <style>{`
        .calendar-view {
          min-height: 100vh;
          padding: 1rem;
          max-width: 48rem;
          margin: 0 auto;
        }
        
        .calendar-header {
          padding: 1rem 0 2rem;
          text-align: center;
        }
        
        .calendar-header h1 {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0 0 1.5rem;
          color: var(--rcl-text);
        }
        
        .calendar-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        
        .calendar-nav h2 {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
          min-width: 150px;
          color: var(--rcl-text);
        }
        
        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 85%);
          background: var(--rcl-bg);
          color: var(--rcl-text);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .nav-btn:hover {
          background: color-mix(in srgb, var(--rcl-primary), transparent 90%);
        }
        
        .calendar-grid-container {
          background: var(--rcl-bg);
          border: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 85%);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .weekday-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: color-mix(in srgb, var(--rcl-primary), transparent 95%);
          border-bottom: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 85%);
        }
        
        .weekday {
          padding: 0.75rem 0;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--rcl-text);
          opacity: 0.6;
          text-align: center;
        }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        
        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          cursor: pointer;
          position: relative;
          transition: background 0.2s ease;
          border-right: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 92%);
          border-bottom: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 92%);
        }
        
        .calendar-day:hover {
          background: color-mix(in srgb, var(--rcl-secondary), transparent 90%);
        }
        
        .calendar-day.other-month {
          opacity: 0.3;
        }
        
        .calendar-day.today {
          background: color-mix(in srgb, var(--rcl-secondary), transparent 85%);
        }
        
        .calendar-day.today .day-number {
          color: var(--rcl-bg);
          font-weight: 700;
          background: var(--rcl-secondary);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .day-number {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 0.9375rem;
          color: var(--rcl-text);
        }
        
        .liturgical-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          margin-top: 2px;
          opacity: 0.85;
        }
        
        .calendar-info {
          text-align: center;
          padding: 2rem 0;
          color: var(--rcl-text);
          opacity: 0.7;
        }
        
        .jump-today-btn {
          margin-top: 1rem;
          background: transparent;
          border: 1px solid var(--rcl-accent);
          color: var(--rcl-accent);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .jump-today-btn:hover {
          background: var(--rcl-accent);
          color: #FFFFFF;
        }
 
        .nav-btn svg {
          width: 20px;
          height: 20px;
        }
 
        @media (min-width: 768px) {
          .calendar-view {
            padding: 2rem;
          }
          
          .calendar-header h1 {
            font-size: 2rem;
          }
          
          .day-number {
            font-size: 1.0625rem;
          }
        }
      `}</style>
    </div>
  );
}

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
