import React from 'react';
import { parseReference } from './lib/references';

interface Verse {
  uvid: number;
  ref: string;
  verse: number;
  text: string;
}

export interface ScriptureBlock {
  type: 'paragraph' | 'heading' | 'poetry';
  text: string;
  verse?: number;
  indent?: number;
}

interface ScriptureRendererProps {
  reference: string;
  type: string;
  text?: string;
  verses?: Verse[];
  blocks?: ScriptureBlock[];
  onReferenceClick?: (ref: string) => void;
}

export function ScriptureRenderer({
  reference,
  type,
  text,
  verses,
  blocks,
  onReferenceClick
}: ScriptureRendererProps) {
  const handleRefClick = (e: React.MouseEvent, ref: string) => {
    e.preventDefault();
    onReferenceClick?.(ref);
  };

  const renderContent = () => {
    // Priority 1: Structured Blocks (Rich Layout)
    if (blocks && blocks.length > 0) {
      return (
        <div className="blocks-container">
          {blocks.map((block, i) => {
            const content = renderTextWithReferences(block.text, handleRefClick);

            if (block.type === 'heading') {
              return <h4 key={i} className="section-heading">{content}</h4>;
            }

            if (block.type === 'poetry') {
              return (
                <div key={i} className="poetry-line" style={{ paddingLeft: `${(block.indent || 0) * 0.5}rem` }}>
                  {block.verse && <span className="verse-number">{block.verse}</span>}
                  <span className="line-text">{content}</span>
                </div>
              );
            }

            return (
              <p key={i} className="prose-paragraph">
                {block.verse && <span className="verse-number">{block.verse}</span>}
                {content}
              </p>
            );
          })}
        </div>
      );
    }

    // Priority 2: Standard Verses (Fallback)
    if (verses && verses.length > 0) {
      return (
        <p className="verse-block">
          {verses.map((v) => (
            <React.Fragment key={v.uvid}>
              <span className="verse-number">{v.verse}</span>
              <span className="verse-text">{renderTextWithReferences(v.text, handleRefClick)}</span>
              {' '}
            </React.Fragment>
          ))}
        </p>
      );
    }

    if (text) {
      return renderTextWithReferences(text, handleRefClick);
    }

    return <p className="loading-text">Loading reading text...</p>;
  };

  return (
    <article className="scripture-reading">
      <header className="scripture-header">
        <span className="reading-type">{type}</span>
        <h3 className="scripture-reference">{reference}</h3>
      </header>

      <div className="scripture-text">
        {renderContent()}
      </div>

      <style>{`
        .scripture-reading {
          margin-bottom: 3rem;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .scripture-header {
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid color-mix(in srgb, var(--rcl-primary), transparent 85%);
        }
        
        .reading-type {
          display: inline-block;
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: calc(0.7rem * var(--text-scale, 1));
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--rcl-secondary);
          margin-bottom: 0.35rem;
        }
        
        .scripture-reference {
          font-family: 'Newsreader', Georgia, serif;
          font-size: calc(1.5rem * var(--text-scale, 1));
          font-weight: 500;
          color: var(--rcl-text);
          margin: 0;
        }
        
        .scripture-text {
          font-family: 'Newsreader', Georgia, serif;
          font-size: calc(1rem * var(--text-scale, 1));
          line-height: 1.85;
          color: var(--rcl-text);
        }

        .blocks-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .section-heading {
          font-family: 'Newsreader', Georgia, serif;
          font-size: calc(1.1rem * var(--text-scale, 1));
          font-weight: 700;
          font-style: italic;
          color: var(--rcl-primary);
          margin: 1.5rem 0 0.5rem 0;
          opacity: 0.9;
        }

        .prose-paragraph {
          margin: 0;
          text-indent: 0;
        }

        .poetry-line {
          margin: 0;
          line-height: 1.6;
          text-indent: -1.5em;
          padding-left: 1.5em; /* Base padding for hanging indent */
        }

        .line-text {
          display: inline;
        }

        .verse-block {
          margin: 0;
        }
        
        .verse-number {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: calc(0.7rem * var(--text-scale, 1));
          font-weight: 700;
          color: var(--rcl-secondary);
          opacity: 0.8;
          vertical-align: super;
          margin-right: 0.45em;
          margin-left: 0.1em;
          user-select: none;
        }

        .verse-text {
          position: relative;
        }
        
        .loading-text {
          font-style: italic;
          color: var(--rcl-text);
          opacity: 0.5;
          font-size: 0.95rem;
        }
        
        .scripture-link {
          color: var(--rcl-accent);
          text-decoration: none;
          border-bottom: 1px solid color-mix(in srgb, var(--rcl-accent), transparent 70%);
          transition: all 0.2s ease;
        }
        
        .scripture-link:hover {
          color: var(--rcl-accent);
          background: color-mix(in srgb, var(--rcl-accent), transparent 90%);
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
  // Regex patterns
  const refPattern = /\b([1-3]?\s?[A-Z][a-z]+(?:\s+of\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?\b/g;
  const verseNumPattern = /(\d+)\u202f/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // We need to match both patterns. For simplicity, let's do a multi-pass or a combined regex.
  // Given they don't overlap (One starts with Book names, other with digits), we can do it sequentially or use a replace-like logic.

  // Let's use a simpler approach: process text into parts and then sub-process parts for verse numbers.

  // First pass: References
  let match;
  while ((match = refPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const fullRef = match[0];
    parts.push(
      <a
        key={`ref-${match.index}`}
        className="scripture-link"
        href="#"
        onClick={(e) => onRefClick(e, fullRef)}
      >
        {fullRef}
      </a>
    );

    lastIndex = match.index + fullRef.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // Second pass: Verse numbers inside the text parts
  return parts.flatMap((part, i) => {
    if (typeof part !== 'string') return [part];

    const subParts: React.ReactNode[] = [];
    let subLastIndex = 0;
    let vMatch;

    // Reset regex state
    verseNumPattern.lastIndex = 0;

    while ((vMatch = verseNumPattern.exec(part)) !== null) {
      if (vMatch.index > subLastIndex) {
        subParts.push(part.slice(subLastIndex, vMatch.index));
      }

      subParts.push(
        <span key={`v-${i}-${vMatch.index}`} className="verse-number">
          {vMatch[1]}
        </span>
      );

      subLastIndex = vMatch.index + vMatch[0].length;
    }

    if (subLastIndex < part.length) {
      subParts.push(part.slice(subLastIndex));
    }

    return subParts;
  });
}


export default ScriptureRenderer;
