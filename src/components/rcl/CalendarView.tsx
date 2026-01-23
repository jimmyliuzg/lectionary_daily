import React, { useState, useMemo } from 'react';
import { formatDateKey, formatDisplayDate } from './lib/lectionary';

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
                        >
                            <span className="day-number">{date.getDate()}</span>
                            {/* Future enhancement: show liturgical color dot here */}
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
          font-family: 'Lora', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0 0 1.5rem;
          color: var(--text-primary, #1A1A1A);
        }
        
        .calendar-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }
        
        .calendar-nav h2 {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0;
          min-width: 150px;
          color: var(--text-primary, #1A1A1A);
        }
        
        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color, rgba(0,0,0,0.1));
          background: var(--surface-bg, #FFFFFF);
          color: var(--text-primary, #1A1A1A);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .nav-btn:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .calendar-grid-container {
          background: var(--surface-bg, #FFFFFF);
          border: 1px solid var(--border-color, rgba(0,0,0,0.1));
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        }
        
        .weekday-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--surface-bg, #F9F9F9);
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1));
        }
        
        .weekday {
          padding: 0.75rem 0;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary, #666666);
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
          border-right: 1px solid var(--border-color, rgba(0,0,0,0.03));
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.03));
        }
        
        .calendar-day:hover {
          background: rgba(184, 134, 11, 0.05);
        }
        
        .calendar-day.other-month {
          color: var(--text-secondary, #BBBBBB);
        }
        
        .calendar-day.today {
          background: rgba(184, 134, 11, 0.08);
        }
        
        .calendar-day.today .day-number {
          color: #B8860B;
          font-weight: 700;
          background: rgba(184, 134, 11, 0.15);
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        
        .day-number {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.9375rem;
          color: var(--text-primary, #1A1A1A);
        }
        
        .calendar-info {
          text-align: center;
          padding: 2rem 0;
          color: var(--text-secondary, #666666);
        }
        
        .jump-today-btn {
          margin-top: 1rem;
          background: transparent;
          border: 1px solid #B8860B;
          color: #B8860B;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .jump-today-btn:hover {
          background: #B8860B;
          color: white;
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
        
        /* Dark mode */
        .dark .calendar-grid-container {
          background: #1A1A1A;
          border-color: rgba(255,255,255,0.1);
        }
        
        .dark .weekday-header {
          background: #121212;
          border-bottom-color: rgba(255,255,255,0.1);
        }
        
        .dark .weekday {
          color: #999999;
        }
        
        .dark .calendar-day {
          border-color: rgba(255,255,255,0.05);
        }
        
        .dark .day-number {
          color: #E8E8E8;
        }
        
        .dark .calendar-day.other-month .day-number {
          color: #444444;
        }
        
        .dark .calendar-day.today {
          background: rgba(218, 165, 32, 0.1);
        }
        
        .dark .calendar-day.today .day-number {
          color: #DAA520;
          background: rgba(218, 165, 32, 0.2);
        }
        
        .dark .calendar-nav h2 {
          color: #E8E8E8;
        }
        
        .dark .nav-btn {
          background: #1A1A1A;
          border-color: rgba(255,255,255,0.1);
          color: #E8E8E8;
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
