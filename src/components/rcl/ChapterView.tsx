import React, { useState, useEffect, useRef } from 'react';
import { getVersesForChapter, getStructuredChapter, type Verse, type ScriptureBlock } from '../../lib/rcl/db';
import { ScriptureRenderer } from './ScriptureRenderer';
import { getBookName, BIBLE_BOOKS } from './lib/references';
import { loadBibleData } from '../../lib/rcl/bibleData';

interface ChapterViewProps {
    bookId: string;
    chapter: number;
    onNavigate: (bookId: string, chapter: number) => void;
    onBack: () => void;
}

// Canonical book order for prev/next rollover across book boundaries
const CANONICAL_BOOKS = [
    ...BIBLE_BOOKS.oldTestament,
    ...BIBLE_BOOKS.newTestament,
];

export const ChapterView: React.FC<ChapterViewProps> = ({
    bookId,
    chapter,
    onNavigate,
    onBack
}) => {
    const [verses, setVerses] = useState<Verse[]>([]);
    const [blocks, setBlocks] = useState<ScriptureBlock[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);

    // Track scroll direction to hide/show header
    const [headerVisible, setHeaderVisible] = useState(true);
    const lastScrollY = useRef(0);

    // Book boundaries
    const bookIndex = CANONICAL_BOOKS.findIndex((b) => b.id === bookId);
    const book = CANONICAL_BOOKS[bookIndex];
    const hasPrev = chapter > 1 || bookIndex > 0;
    const hasNext = chapter < (book?.chapters ?? 0) || bookIndex < CANONICAL_BOOKS.length - 1;

    const prevChapter = (): [string, number] => {
        if (chapter > 1) return [bookId, chapter - 1];
        const prevBook = CANONICAL_BOOKS[bookIndex - 1];
        return prevBook ? [prevBook.id, prevBook.chapters] : [bookId, 1];
    };

    const nextChapter = (): [string, number] => {
        if (chapter < (book?.chapters ?? 0)) return [bookId, chapter + 1];
        const nextBook = CANONICAL_BOOKS[bookIndex + 1];
        return nextBook ? [nextBook.id, 1] : [bookId, chapter];
    };

    useEffect(() => {
        let cancelled = false;
        const loadContent = async () => {
            setIsLoading(true);
            try {
                // Try structured first
                const structuredBlocks = await getStructuredChapter(bookId, chapter);
                if (cancelled) return;
                if (structuredBlocks) {
                    setBlocks(structuredBlocks);
                    setVerses([]);
                } else {
                    setBlocks(null);
                    const dbVerses = await getVersesForChapter(`${bookId}.${chapter}`);
                    if (cancelled) return;
                    if (dbVerses && dbVerses.length > 0) {
                        setVerses(dbVerses);
                    } else {
                        // Fallback: lazy-load the bundled JSON (only when the DB
                        // hasn't been hydrated yet)
                        const bibleData = await loadBibleData();
                        if (cancelled) return;
                        const filtered = bibleData.verses.filter(
                            (v: Verse) => v.ref.startsWith(`${bookId}.${chapter}.`)
                        );
                        setVerses(filtered);
                    }
                }
            } catch (e) {
                console.error('Failed to load from DB:', e);
                if (cancelled) return;
                setBlocks(null);
                try {
                    const bibleData = await loadBibleData();
                    if (cancelled) return;
                    const filtered = bibleData.verses.filter(
                        (v: Verse) => v.ref.startsWith(`${bookId}.${chapter}.`)
                    );
                    setVerses(filtered);
                } catch (e2) {
                    console.error('Fallback load failed:', e2);
                    setVerses([]);
                }
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        loadContent();
        return () => { cancelled = true; };
    }, [bookId, chapter]);

    // Touch handlers for swipe navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchEndX.current === touchStartX.current) return;

        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;

        if (diff > threshold) {
            // Swiped left - go to next chapter
            if (hasNext) {
                const [b, c] = nextChapter();
                onNavigate(b, c);
            }
        } else if (diff < -threshold) {
            // Swiped right - go to previous chapter
            if (hasPrev) {
                const [b, c] = prevChapter();
                onNavigate(b, c);
            }
        }
    };

    // Handle click on left/right edge zones
    const handleEdgeClick = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && hasPrev) {
            const [b, c] = prevChapter();
            onNavigate(b, c);
        } else if (direction === 'next' && hasNext) {
            const [b, c] = nextChapter();
            onNavigate(b, c);
        }
    };

    // Keyboard navigation (Left/Right arrows)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                if (hasNext) {
                    const [b, c] = nextChapter();
                    onNavigate(b, c);
                }
            } else if (e.key === 'ArrowLeft') {
                if (hasPrev) {
                    const [b, c] = prevChapter();
                    onNavigate(b, c);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [bookId, chapter, hasPrev, hasNext]);

    // Track scroll direction to hide/show header
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const scrollingDown = currentScrollY > lastScrollY.current;
            const atTop = currentScrollY < 50;

            if (atTop) {
                setHeaderVisible(true);
            } else if (scrollingDown && currentScrollY > 100) {
                setHeaderVisible(false);
            } else if (!scrollingDown) {
                setHeaderVisible(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Use full book name (e.g., 'Genesis' instead of 'Gen')
    const bookName = getBookName(bookId);
    const nextName = bookIndex < CANONICAL_BOOKS.length - 1 && chapter >= (book?.chapters ?? 0)
        ? getBookName(CANONICAL_BOOKS[bookIndex + 1].id)
        : bookName;
    const prevName = bookIndex > 0 && chapter <= 1
        ? getBookName(CANONICAL_BOOKS[bookIndex - 1].id)
        : bookName;

    return (
        <div
            className="chapter-view-container"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <style>{`
                .chapter-view-container {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    background: var(--rcl-background);
                    color: var(--rcl-text);
                    transition: colors 0.3s ease;
                }
                
                .chapter-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0.75rem 1rem;
                    padding-left: 4.5rem;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                    /* Frosted glass effect */
                    background: color-mix(in srgb, var(--rcl-bg), transparent 10%);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid color-mix(in srgb, var(--rcl-text), transparent 90%);
                }
                
                .chapter-header.header-hidden {
                    transform: translateY(-100%);
                    opacity: 0;
                    pointer-events: none;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    min-width: 0;
                }
                
                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    color: var(--rcl-secondary);
                    font-family: 'Cabin', system-ui, sans-serif;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0.5rem 0.75rem;
                    border-radius: 8px;
                    transition: background 0.2s ease;
                    white-space: nowrap;
                    max-width: 100%;
                    overflow: hidden;
                }
                
                .back-btn:hover {
                    background: color-mix(in srgb, var(--rcl-secondary), transparent 88%);
                }

                .back-btn svg {
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                }

                .back-btn-text {
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .chapter-title {
                    font-family: 'Newsreader', Georgia, serif;
                    font-size: calc(1.125rem * var(--text-scale, 1));
                    font-weight: 500;
                    margin: 0;
                    text-align: center;
                    flex: 1;
                    padding: 0 0.5rem;
                    min-width: 0;
                }

                .chapter-nav-btns {
                    display: flex;
                    gap: 0.125rem;
                    align-items: center;
                }
                
                .chapter-nav-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: transparent;
                    color: var(--rcl-text);
                    cursor: pointer;
                    border-radius: 10px;
                    transition: background 0.2s ease;
                }

                .chapter-nav-btn:disabled {
                    opacity: 0.2;
                    cursor: default;
                }
                
                .chapter-nav-btn:not(:disabled):hover {
                    background: color-mix(in srgb, var(--rcl-secondary), transparent 85%);
                }
                
                .chapter-nav-btn svg {
                    width: 22px;
                    height: 22px;
                }
                
                .chapter-content {
                    flex: 1;
                    padding: 1rem;
                    max-width: 42rem;
                    margin: 0 auto;
                    width: 100%;
                }

                @media (max-width: 480px) {
                    .chapter-header {
                        padding-left: 3.75rem;
                        padding-right: 0.75rem;
                    }

                    .back-btn-text {
                        display: none;
                    }

                    .back-btn {
                        padding: 0.5rem;
                    }

                    .chapter-title {
                        font-size: calc(1rem * var(--text-scale, 1));
                    }
                }

                /* Edge navigation zones — decorative gradient (click-through) */
                .edge-nav {
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    width: 18%;
                    z-index: 4;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                }

                .edge-nav-left {
                    left: 0;
                    background: linear-gradient(to right, var(--rcl-bg) 0%, transparent 100%);
                }

                .edge-nav-right {
                    right: 0;
                    background: linear-gradient(to left, var(--rcl-bg) 0%, transparent 100%);
                }

                /* Actual clickable hit strip (narrow, so content stays clickable) */
                .edge-hit {
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    width: 22px;
                    z-index: 4;
                    cursor: pointer;
                }

                .edge-hit-left { left: 0; }
                .edge-hit-right { right: 0; }

                .edge-hit:hover ~ .edge-nav,
                .chapter-view-container:hover .edge-nav {
                    opacity: 0.15;
                }

                .edge-nav::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 3px;
                    height: 48px;
                    border-radius: 2px;
                    background: var(--rcl-text);
                    opacity: 0;
                    transition: opacity 0.25s ease;
                }

                .edge-nav-left::after { left: 8px; }
                .edge-nav-right::after { right: 8px; }

                @media (hover: hover) {
                    .chapter-view-container:hover .edge-nav { opacity: 0.15; }
                    .edge-nav:hover { opacity: 0.4 !important; }
                    .edge-nav:hover::after { opacity: 0.6; }
                }

                @media (hover: none) {
                    .edge-nav { opacity: 0.06; }
                    .edge-hit { width: 18px; }
                }

                /* Bottom chapter navigation */
                .chapter-bottom-nav {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                    padding: 1.5rem 0 3rem;
                    margin-top: 1rem;
                    border-top: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 85%);
                }

                .bottom-nav-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.25rem;
                    padding: 0.75rem 1rem;
                    background: color-mix(in srgb, var(--rcl-primary), transparent 93%);
                    border: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 82%);
                    border-radius: 12px;
                    color: var(--rcl-text);
                    font-family: 'Cabin', system-ui, sans-serif;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    max-width: 48%;
                }

                .bottom-nav-btn.next {
                    align-items: flex-end;
                    text-align: right;
                    margin-left: auto;
                }

                .bottom-nav-btn:disabled {
                    opacity: 0.3;
                    cursor: default;
                }

                .bottom-nav-btn:not(:disabled):hover {
                    border-color: var(--rcl-secondary);
                    transform: translateY(-1px);
                }

                .bottom-nav-label {
                    font-size: 0.7rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    opacity: 0.6;
                }

                .bottom-nav-text {
                    font-size: 0.9375rem;
                    font-weight: 500;
                    color: var(--rcl-secondary);
                }
            `}</style>

            {/* Edge navigation zones (visual) + hit strips (interactive) */}
            <div className="edge-nav edge-nav-left" aria-hidden="true" />
            <div className="edge-nav edge-nav-right" aria-hidden="true" />
            <div
                className="edge-hit edge-hit-left"
                onClick={() => handleEdgeClick('prev')}
                role="button"
                aria-label="Previous chapter"
                tabIndex={-1}
            />
            <div
                className="edge-hit edge-hit-right"
                onClick={() => handleEdgeClick('next')}
                role="button"
                aria-label="Next chapter"
                tabIndex={-1}
            />

            {/* Header with frosted glass */}
            <header className={`chapter-header ${headerVisible ? '' : 'header-hidden'}`}>
                <div className="header-left">
                    <button onClick={onBack} className="back-btn" aria-label="Back to Bible">
                        <ChevronLeft />
                        <span className="back-btn-text">{bookName}</span>
                    </button>
                </div>
                <h2 className="chapter-title">{bookName} {chapter}</h2>
                <div className="chapter-nav-btns">
                    <button
                        className="chapter-nav-btn"
                        onClick={() => handleEdgeClick('prev')}
                        disabled={!hasPrev}
                        aria-label="Previous chapter"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        className="chapter-nav-btn"
                        onClick={() => handleEdgeClick('next')}
                        disabled={!hasNext}
                        aria-label="Next chapter"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </header>

            {/* Content */}
            <div className="chapter-content">
                {isLoading ? (
                    <div className="text-center py-20 text-gray-400">Loading chapter...</div>
                ) : (blocks || verses.length > 0) ? (
                    <ScriptureRenderer
                        reference={`${bookName} ${chapter}`}
                        type="Chapter Reading"
                        verses={blocks ? undefined : verses}
                        blocks={blocks || undefined}
                    />
                ) : (
                    <div className="text-center py-20 text-gray-500 font-serif">
                        <p>Content for {bookName} {chapter} not available.</p>
                    </div>
                )}

                {/* Bottom prev/next navigation */}
                <div className="chapter-bottom-nav">
                    <button
                        className="bottom-nav-btn"
                        onClick={() => handleEdgeClick('prev')}
                        disabled={!hasPrev}
                    >
                        <span className="bottom-nav-label">Previous</span>
                        <span className="bottom-nav-text">
                            {chapter > 1 ? `${bookName} ${chapter - 1}` : `${prevName} ${CANONICAL_BOOKS[bookIndex - 1]?.chapters ?? ''}`}
                        </span>
                    </button>
                    <button
                        className="bottom-nav-btn next"
                        onClick={() => handleEdgeClick('next')}
                        disabled={!hasNext}
                    >
                        <span className="bottom-nav-label">Next</span>
                        <span className="bottom-nav-text">
                            {chapter < (book?.chapters ?? 0) ? `${bookName} ${chapter + 1}` : `${nextName} 1`}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

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

export default ChapterView;
