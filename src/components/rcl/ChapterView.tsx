import React, { useState, useEffect, useRef } from 'react';
import { getVersesForChapter, getStructuredChapter, type Verse, type ScriptureBlock } from '../../lib/rcl/db';
import { ScriptureRenderer } from './ScriptureRenderer';
import { getBookName } from './lib/references';

interface ChapterViewProps {
    bookId: string;
    chapter: number;
    bibleData: { verses: Verse[] };
    onNavigate: (bookId: string, chapter: number) => void;
    onBack: () => void;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
    bookId,
    chapter,
    bibleData,
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

    useEffect(() => {
        const loadContent = async () => {
            setIsLoading(true);
            try {
                // Try structured first
                const structuredBlocks = await getStructuredChapter(bookId, chapter);
                if (structuredBlocks) {
                    setBlocks(structuredBlocks);
                } else {
                    setBlocks(null);
                    const dbVerses = await getVersesForChapter(`${bookId}.${chapter}`);
                    if (dbVerses && dbVerses.length > 0) {
                        setVerses(dbVerses);
                    } else {
                        // Fallback to prop data
                        const filtered = bibleData.verses.filter(
                            (v: Verse) => v.ref.startsWith(`${bookId}.${chapter}.`)
                        );
                        setVerses(filtered);
                    }
                }
            } catch (e) {
                console.error('Failed to load from DB:', e);
                setBlocks(null);
                const filtered = bibleData.verses.filter(
                    (v: Verse) => v.ref.startsWith(`${bookId}.${chapter}.`)
                );
                setVerses(filtered);
            } finally {
                setIsLoading(false);
            }
        };
        loadContent();
    }, [bookId, chapter, bibleData]);

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
            onNavigate(bookId, chapter + 1);
        } else if (diff < -threshold) {
            // Swiped right - go to previous chapter
            if (chapter > 1) {
                onNavigate(bookId, chapter - 1);
            }
        }
    };

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
                    padding: 1rem;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                    transition: transform 0.3s ease, opacity 0.3s ease;
                    /* Frosted glass effect */
                    background: color-mix(in srgb, var(--rcl-background), transparent 10%);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-bottom: 1px solid color-mix(in srgb, var(--rcl-text), transparent 90%);
                }
                
                .chapter-header.header-hidden {
                    transform: translateY(-100%);
                    opacity: 0;
                    pointer-events: none;
                }
                
                .back-btn {
                    color: var(--rcl-secondary);
                    font-family: 'Newsreader', Georgia, serif;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                }
                
                .back-btn:hover {
                    text-decoration: underline;
                }
                
                .chapter-title {
                    font-family: 'Newsreader', Georgia, serif;
                    font-size: 1.25rem;
                    font-weight: 700;
                    margin: 0;
                }
                
                .chapter-content {
                    flex: 1;
                    padding: 1rem;
                    max-width: 42rem;
                    margin: 0 auto;
                    width: 100%;
                }
                
                .nav-footer {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid color-mix(in srgb, var(--rcl-text), transparent 90%);
                }
                
                .nav-footer button {
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    background: transparent;
                    border: none;
                    color: var(--rcl-secondary);
                    font-family: 'Newsreader', Georgia, serif;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                
                .nav-footer button:hover {
                    background: color-mix(in srgb, var(--rcl-secondary), transparent 85%);
                }
            `}</style>

            {/* Header with frosted glass */}
            <header className={`chapter-header ${headerVisible ? '' : 'header-hidden'}`}>
                <button onClick={onBack} className="back-btn">
                    ← {bookName}
                </button>
                <h2 className="chapter-title">Chapter {chapter}</h2>
                <div style={{ width: '4rem' }}></div> {/* Spacer for alignment */}
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

                {/* Navigation Footer */}
                <div className="nav-footer">
                    <button
                        onClick={() => onNavigate(bookId, Math.max(1, chapter - 1))}
                        style={{ visibility: chapter <= 1 ? 'hidden' : 'visible' }}
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={() => onNavigate(bookId, chapter + 1)}
                    >
                        Next →
                    </button>
                </div>
                <div style={{ height: '5rem' }}></div> {/* Bottom padding */}
            </div>
        </div>
    );
};

export default ChapterView;
