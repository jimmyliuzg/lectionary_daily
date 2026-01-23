import React from 'react';
import { parseReference } from './lib/references';

interface ScriptureRendererProps {
    reference: string;
    type: string;
    text?: string;
    onReferenceClick?: (ref: string) => void;
}

/**
 * Unified component for rendering scripture text
 * Used for both lectionary readings and Bible chapter views
 */
export function ScriptureRenderer({
    reference,
    type,
    text,
    onReferenceClick
}: ScriptureRendererProps) {
    const parsed = parseReference(reference);

    // Placeholder text when Bible data isn't loaded yet
    const displayText = text || getPlaceholderText(reference);

    const handleRefClick = (e: React.MouseEvent, ref: string) => {
        e.preventDefault();
        onReferenceClick?.(ref);
    };

    return (
        <article className="scripture-reading">
            <header className="scripture-header">
                <span className="reading-type">{type}</span>
                <h3 className="scripture-reference">{reference}</h3>
            </header>

            <div className="scripture-text">
                {renderTextWithReferences(displayText, handleRefClick)}
            </div>

            <style>{`
        .scripture-reading {
          margin-bottom: 2rem;
        }
        
        .scripture-header {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1));
        }
        
        .reading-type {
          display: inline-block;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent-color, #B8860B);
          margin-bottom: 0.25rem;
        }
        
        .scripture-reference {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 500;
          color: var(--text-primary, #1A1A1A);
          margin: 0;
        }
        
        .scripture-text {
          font-family: 'Lora', Georgia, serif;
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--text-primary, #1A1A1A);
        }
        
        .scripture-text p {
          margin-bottom: 1em;
        }
        
        .verse-number {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.7em;
          font-weight: 600;
          color: var(--accent-color, #B8860B);
          vertical-align: super;
          margin-right: 0.25em;
        }
        
        .scripture-link {
          color: var(--link-color, #4A6FA5);
          text-decoration: underline;
          text-decoration-style: dotted;
          cursor: pointer;
        }
        
        .scripture-link:hover {
          text-decoration-style: solid;
        }
        
        /* Dark mode */
        .dark .scripture-reference,
        .dark .scripture-text {
          color: #E8E8E8;
        }
        
        .dark .scripture-header {
          border-bottom-color: rgba(255,255,255,0.1);
        }
        
        .dark .reading-type {
          color: #DAA520;
        }
        
        .dark .verse-number {
          color: #DAA520;
        }
        
        .dark .scripture-link {
          color: #7DA1D4;
        }
      `}</style>
        </article>
    );
}

/**
 * Parse text and convert Bible references to clickable links
 */
function renderTextWithReferences(
    text: string,
    onRefClick: (e: React.MouseEvent, ref: string) => void
): React.ReactNode {
    // Simple reference pattern for cross-references
    const refPattern = /\b([1-3]?\s?[A-Z][a-z]+(?:\s+of\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?\b/g;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = refPattern.exec(text)) !== null) {
        // Add text before match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }

        // Add clickable reference
        const fullRef = match[0];
        parts.push(
            <a
                key={match.index}
                className="scripture-link"
                href="#"
                onClick={(e) => onRefClick(e, fullRef)}
            >
                {fullRef}
            </a>
        );

        lastIndex = match.index + fullRef.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    // Split into paragraphs
    if (parts.length === 1 && typeof parts[0] === 'string') {
        return parts[0].split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
        ));
    }

    return <p>{parts}</p>;
}

/**
 * Generate placeholder text for readings before Bible data is loaded
 */
function getPlaceholderText(reference: string): string {
    const parsed = parseReference(reference);
    if (!parsed) {
        return `Loading ${reference}...`;
    }

    // Generate sample placeholder based on the reference
    const placeholders: Record<string, string> = {
        'PSA': `Blessed is the one who does not walk in step with the wicked
or stand in the way that sinners take
or sit in the company of mockers,
but whose delight is in the law of the LORD,
and who meditates on his law day and night.

That person is like a tree planted by streams of water,
which yields its fruit in season
and whose leaf does not wither—
whatever they do prospers.`,
        'GEN': `In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.

And God said, "Let there be light," and there was light. God saw that the light was good, and he separated the light from the darkness.`,
        'JHN': `In the beginning was the Word, and the Word was with God, and the Word was God. He was with God in the beginning. Through him all things were made; without him nothing was made that has been made.

In him was life, and that life was the light of all mankind. The light shines in the darkness, and the darkness has not overcome it.`,
    };

    return placeholders[parsed.bookId] || `[Scripture text for ${reference} will load from the Berean Standard Bible]`;
}

export default ScriptureRenderer;
