import React, { useState } from 'react';

// Define types for our data
interface Book {
    id: string;
    name: string;
    chapters: number;
    testament: 'OT' | 'NT';
}

interface BibleBrowserProps {
    onNavigate: (bookId: string, chapter: number) => void;
    bibleData: { books: Book[]; verses: any[] };
    initialBookId?: string;
}

export const BibleBrowser: React.FC<BibleBrowserProps> = ({ onNavigate, bibleData, initialBookId }) => {
    // Find initial book if provided
    const initialBook = initialBookId
        ? bibleData.books.find(b => b.id === initialBookId) || null
        : null;

    const [selectedBook, setSelectedBook] = useState<Book | null>(initialBook);
    const [activeTab, setActiveTab] = useState<'OT' | 'NT'>('OT');

    // Sync selectedBook with initialBookId when it changes
    React.useEffect(() => {
        if (initialBookId) {
            const book = bibleData.books.find(b => b.id === initialBookId);
            if (book) setSelectedBook(book);
        }
    }, [initialBookId, bibleData]);

    const books = bibleData.books.filter(b => b.testament === activeTab);

    return (
        <div className="flex flex-col h-full bg-rcl-cream dark:bg-rcl-night text-rcl-ink dark:text-gray-100 transition-colors duration-300">

            {/* Header / Tabs */}
            {!selectedBook && (
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        className={`flex-1 py-3 text-center font-serif text-lg ${activeTab === 'OT'
                            ? 'border-b-2 border-rcl-gold font-bold text-rcl-ink dark:text-white'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                            }`}
                        onClick={() => setActiveTab('OT')}
                    >
                        Old Testament
                    </button>
                    <button
                        className={`flex-1 py-3 text-center font-serif text-lg ${activeTab === 'NT'
                            ? 'border-b-2 border-rcl-gold font-bold text-rcl-ink dark:text-white'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
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
                    <div className="animate-fade-in">
                        <button
                            onClick={() => setSelectedBook(null)}
                            className="mb-4 flex items-center text-rcl-gold hover:underline font-serif"
                        >
                            ← Back to Books
                        </button>
                        <h2 className="text-2xl font-serif font-bold mb-6 text-center">{selectedBook.name}</h2>
                        <div className="grid grid-cols-5 gap-4">
                            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map((chapter) => (
                                <button
                                    key={chapter}
                                    onClick={() => onNavigate(selectedBook.id, chapter)}
                                    className="aspect-square flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-rcl-parchment dark:hover:bg-gray-800 hover:border-rcl-gold transition-colors font-serif text-lg"
                                >
                                    {chapter}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Book Selection View
                    <div className="grid grid-cols-1 gap-2 animate-fade-in">
                        {books.map((book) => (
                            <button
                                key={book.id}
                                onClick={() => setSelectedBook(book)}
                                className="p-4 text-left rounded-lg hover:bg-rcl-parchment dark:hover:bg-gray-800 transition-colors font-serif text-xl border-b border-gray-100 dark:border-gray-800 last:border-0"
                            >
                                {book.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
