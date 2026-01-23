import React, { useState, useMemo, useEffect, useRef } from 'react';
import rawBibleData from '../../data/bible-bsb.json';
import { parseReference, formatReference } from './lib/references';

const bibleData = rawBibleData as { verses: SearchResult[] };

interface SearchViewProps {
    onNavigate: (bookId: string, chapter: number) => void;
}

interface SearchResult {
    uvid: number;
    ref: string;
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export function SearchView({ onNavigate }: SearchViewProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus search on mount
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);

        // Use setTimeout to allow UI to update (searching state)
        setTimeout(() => {
            // 1. Try to parse as reference
            const parsed = parseReference(query);
            if (parsed) {
                onNavigate(parsed.bookId, parsed.chapter);
                setIsSearching(false);
                return;
            }

            // 2. Otherwise perform text search
            // Initially, we just search the entire JSON.
            // In Phase 4, we'll swap this for IndexedDB search.
            const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);

            if (searchTerms.length === 0) {
                setResults([]);
                setIsSearching(false);
                return;
            }

            const filtered = (bibleData.verses as SearchResult[]).filter(v => {
                const text = v.text.toLowerCase();
                return searchTerms.every(term => text.includes(term));
            }).slice(0, 100); // Limit results for performance

            setResults(filtered);
            setIsSearching(false);
        }, 10);
    };

    const handleResultClick = (result: SearchResult) => {
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
                        <SearchIllustration />
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
          background: inherit;
          z-index: 10;
        }
        
        .search-header h1 {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 500;
          margin: 0 0 1.5rem;
          color: var(--text-primary, #1A1A1A);
          text-align: center;
        }
        
        .search-box-container {
          display: flex;
          gap: 0.5rem;
          background: var(--surface-bg, #F5F5F7);
          padding: 0.5rem;
          border-radius: 12px;
          border: 1px solid var(--border-color, rgba(0,0,0,0.1));
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .search-input {
          flex: 1;
          border: none;
          background: transparent;
          padding: 0.5rem 0.75rem;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 1rem;
          color: var(--text-primary, #1A1A1A);
          outline: none;
        }
        
        .search-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          background: #B8860B;
          color: white;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        
        .search-btn:hover {
          background: #9A7209;
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
          font-size: 0.8rem;
          color: var(--text-secondary, #666666);
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
          background: var(--surface-bg, #FFFFFF);
          border: 1px solid var(--border-color, rgba(0,0,0,0.1));
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .result-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border-color: #B8860B;
        }
        
        .result-meta {
          margin-bottom: 0.5rem;
        }
        
        .result-ref {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #B8860B;
        }
        
        .result-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.0625rem;
          line-height: 1.6;
          color: var(--text-primary, #1A1A1A);
        }
        
        .no-results, .search-empty {
          text-align: center;
          padding: 4rem 1rem;
          color: var(--text-secondary, #666666);
        }
        
        .search-empty svg {
          opacity: 0.2;
          margin-bottom: 1.5rem;
        }
        
        .search-empty p {
          max-width: 300px;
          margin: 0 auto;
        }

        @media (min-width: 768px) {
          .search-view {
            padding: 2rem;
          }
          
          .search-header h1 {
            font-size: 2rem;
          }
        }
        
        /* Dark mode */
        .dark .search-box-container {
          background: #1A1A1A;
          border-color: rgba(255,255,255,0.1);
        }
        
        .dark .search-input {
          color: #E8E8E8;
        }
        
        .dark .result-item {
          background: #1A1A1A;
          border-color: rgba(255,255,255,0.1);
        }
        
        .dark .result-text {
          color: #E8E8E8;
        }
        
        .dark .results-count {
          color: #999999;
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

function SearchIllustration() {
    return (
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5z" />
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <circle cx="12" cy="10" r="3" />
            <line x1="14.5" y1="12.5" x2="17" y2="15" />
        </svg>
    );
}
