import React, { useState, useEffect } from 'react';
import { getVersesForChapter, getStructuredChapter, type Verse, type ScriptureBlock } from '../../lib/rcl/db';
import { ScriptureRenderer } from './ScriptureRenderer';

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

    const bookName = verses.length > 0 ? verses[0].book : (blocks ? bookId : 'Bible');

    return (
        <div className="flex flex-col h-full bg-rcl-cream dark:bg-rcl-night text-rcl-ink dark:text-gray-100 transition-colors duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-rcl-cream dark:bg-rcl-night sticky top-0 z-10">
                <button
                    onClick={onBack}
                    className="text-rcl-gold font-serif hover:underline"
                >
                    ← {bookName}
                </button>
                <h2 className="text-xl font-serif font-bold">Chapter {chapter}</h2>
                <div className="w-16"></div> {/* Spacer for alignment */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
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
                <div className="flex justify-between mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={() => onNavigate(bookId, Math.max(1, chapter - 1))}
                        className={`px-4 py-2 rounded hover:bg-rcl-parchment dark:hover:bg-gray-800 text-rcl-gold transition-colors font-serif ${chapter <= 1 ? 'invisible' : ''}`}
                    >
                        ← Previous
                    </button>
                    <button
                        onClick={() => onNavigate(bookId, chapter + 1)}
                        className="px-4 py-2 rounded hover:bg-rcl-parchment dark:hover:bg-gray-800 text-rcl-gold transition-colors font-serif"
                    >
                        Next →
                    </button>
                </div>
                <div className="h-20"></div> {/* Bottom padding */}
            </div>
        </div>
    );
};

export default ChapterView;
