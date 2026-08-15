import React, { useState } from 'react';
import { BIBLE_BOOKS } from './lib/references';

interface Book {
    id: string;
    name: string;
    chapters: number;
    testament: 'OT' | 'NT';
}

interface BibleBrowserProps {
    onNavigate: (bookId: string, chapter: number) => void;
    initialBookId?: string;
}

export const BibleBrowser: React.FC<BibleBrowserProps> = ({ onNavigate, initialBookId }) => {
    // Find initial book if provided
    const allBooks: Book[] = [
        ...BIBLE_BOOKS.oldTestament.map((b) => ({ ...b, testament: 'OT' as const })),
        ...BIBLE_BOOKS.newTestament.map((b) => ({ ...b, testament: 'NT' as const })),
    ];

    const initialBook = initialBookId
        ? allBooks.find((b) => b.id === initialBookId) || null
        : null;

    const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook);
    const [activeTab, setActiveTab] = useState<'OT' | 'NT'>('OT');

    // Sync selectedBook with initialBookId when it changes
    React.useEffect(() => {
        if (initialBookId) {
            const book = allBooks.find((b) => b.id === initialBookId);
            if (book) setSelectedBook(book);
        }
    }, [initialBookId]);

    const books = allBooks.filter((b) => b.testament === activeTab);

    return (
        <div className="flex flex-col h-full bg-rcl-background text-rcl-text transition-colors duration-300">

            {/* Header / Tabs */}
            {!selectedBook && (
                <div className="flex border-b border-rcl-primary/20">
                    <button
                        className={`flex-1 py-3 text-center font-serif text-lg ${activeTab === 'OT'
                            ? 'border-b-2 border-rcl-secondary font-bold text-rcl-text'
                            : 'opacity-60 hover:opacity-100'
                            }`}
                        onClick={() => setActiveTab('OT')}
                    >
                        Old Testament
                    </button>
                    <button
                        className={`flex-1 py-3 text-center font-serif text-lg ${activeTab === 'NT'
                            ? 'border-b-2 border-rcl-secondary font-bold text-rcl-text'
                            : 'opacity-60 hover:opacity-100'
                            }`}
                        onClick={() => setActiveTab('NT')}
                    >
                        New Testament
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {selectedBook ? (
                    // Chapter Selection View
                    <div className="animate-fade-in max-w-4xl mx-auto">
                        <button
                            onClick={() => setSelectedBook(null)}
                            className="mb-2 flex items-center text-rcl-accent hover:underline font-serif text-sm opacity-80"
                        >
                            ← Back to Books
                        </button>
                        <h2 className="text-xl font-serif font-bold mb-4 text-center">{selectedBook.name}</h2>
                        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 animate-fade-in pb-12">
                            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                                <button
                                    key={chapter}
                                    onClick={() => onNavigate(selectedBook.id, chapter)}
                                    className="aspect-square flex items-center justify-center rounded-lg bg-rcl-primary/5 dark:bg-white/5 border border-rcl-primary/10 dark:border-white/10 hover:border-rcl-secondary/70 transition-all duration-200 hover:scale-105 font-serif text-base font-medium text-rcl-text hover:text-rcl-secondary"
                                >
                                    {chapter}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Book Selection View - Modern Grid Pattern
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-fade-in pb-12">
                        {books.map((book) => (
                            <button
                                key={book.id}
                                onClick={() => setSelectedBook(book)}
                                className="group relative flex flex-col p-4 text-left rounded-xl bg-rcl-primary/5 dark:bg-white/5 border border-rcl-primary/10 dark:border-white/10 hover:border-rcl-secondary/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                            >
                                <span className="font-serif text-lg font-medium text-rcl-text group-hover:text-rcl-secondary transition-colors">
                                    {book.name}
                                </span>
                                <span className="text-[0.65rem] uppercase tracking-widest opacity-40 mt-1 font-sans">
                                    {book.chapters} Chapters
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
