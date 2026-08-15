import React, { useState, useEffect, useRef } from 'react';
import { parseReference, formatReference } from './lib/references';
import { loadBibleData } from '../../lib/rcl/bibleData';
import type { Verse } from '../../lib/rcl/db';

interface SearchViewProps {
  onNavigate: (bookId: string, chapter: number) => void;
}

export function SearchView({ onNavigate }: SearchViewProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Verse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);

    // 1. Try to parse as reference
    const parsed = parseReference(query);
    if (parsed) {
      onNavigate(parsed.bookId, parsed.chapter);
      setIsSearching(false);
      return;
    }

    // 2. Otherwise perform text search over the full Bible (lazy-loaded)
    const searchTerms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    if (searchTerms.length === 0) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const bibleData = await loadBibleData();
      const filtered = bibleData.verses.filter((v) => {
        const text = v.text.toLowerCase();
        return searchTerms.every((term) => text.includes(term));
      }).slice(0, 100); // Limit results for performance
      setResults(filtered);
    } catch (err) {
      console.error('Search failed:', err);
      setResults([]);
    }
    setIsSearching(false);
  };

  const handleResultClick = (result: Verse) => {
    onNavigate(result.ref.split('.')[0], result.chapter);
  };

  return (
    <div className="search-view">
      <header className="search-header">
        <h1>Search Bible</h1>
        <form onSubmit={handleSearch} className="search-box-container">
          <input
            ref={searchInputRef}
            type="text"
            className="search-input"
            placeholder="Search by text (e.g. 'love one another') or reference ('John 3:16')"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="search-btn">
            {isSearching ? '...' : <SearchIcon />}
          </button>
        </form>
      </header>

      <main className="search-results">
        {results.length > 0 ? (
          <div className="results-list">
            <p className="results-count">Found {results.length} {results.length === 100 ? '+' : ''} results</p>
            {results.map((result) => (
              <button
                key={result.uvid}
                className="result-item"
                onClick={() => handleResultClick(result)}
              >
                <div className="result-meta">
                  <span className="result-ref">{formatReference(result.ref.split('.')[0], result.chapter, result.verse)}</span>
                </div>
                <div className="result-text">{result.text}</div>
              </button>
            ))}
          </div>
        ) : query && !isSearching ? (
          <div className="no-results">
            <p>No results found for "{query}"</p>
            <p className="hint">Try searching for a different keyword or reference.</p>
          </div>
        ) : (
          <div className="search-empty">
            <p>Search over 30,000 verses in the Berean Standard Bible</p>
          </div>
        )}
      </main>

      <style>{`
        .search-view {
          min-height: 100vh;
          padding: 1rem;
          max-width: 48rem;
          margin: 0 auto;
        }
        
        .search-header {
          padding: 1rem 0 2rem;
          position: sticky;
          top: 0;
          z-index: 10;
          /* Frosted glass effect matching TodayView */
          background: color-mix(in srgb, var(--rcl-bg), transparent 10%);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          margin: -1rem -1rem 0 -1rem;
          padding: 1rem 1rem 1.5rem 1rem;
          border-bottom: 1px solid color-mix(in srgb, var(--rcl-text), transparent 90%);
        }
        
        .search-header h1 {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0 0 1.5rem;
          color: var(--rcl-text);
          text-align: center;
        }
        
        .search-box-container {
          display: flex;
          gap: 0.5rem;
          background: color-mix(in srgb, var(--rcl-primary), transparent 92%);
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 80%);
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.5rem 0.75rem;
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 1rem;
          color: var(--rcl-text);
          outline: none;
        }

        .search-input::placeholder {
          color: var(--rcl-text);
          opacity: 0.45;
        }
        
        .search-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: var(--rcl-accent);
          color: var(--rcl-bg);
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        
        .search-btn:hover {
          opacity: 0.85;
          transform: translateY(-1px);
        }
        
        .search-btn svg {
          width: 20px;
          height: 20px;
        }
        
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .results-count {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 0.8rem;
          color: var(--rcl-text);
          opacity: 0.6;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        
        .result-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 1.25rem;
          background: color-mix(in srgb, var(--rcl-primary), transparent 93%);
          border: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 82%);
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        
        .result-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: var(--rcl-accent);
        }
        
        .result-meta {
          margin-bottom: 0.5rem;
        }
        
        .result-ref {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--rcl-accent);
        }
        
        .result-text {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.0625rem;
          line-height: 1.6;
          color: var(--rcl-text);
        }
        
        .no-results, .search-empty {
          text-align: center;
          padding: 4rem 1rem;
          color: var(--rcl-text);
          opacity: 0.6;
        }
        
        .search-empty svg {
          opacity: 0.3;
          margin-bottom: 1.5rem;
          color: var(--rcl-secondary);
        }
        
        .search-empty p {
          max-width: 300px;
          margin: 0 auto;
          font-family: 'Cabin', system-ui, sans-serif;
        }

        @media (min-width: 768px) {
          .search-view {
            padding: 2rem;
          }
          
          .search-header h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
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


