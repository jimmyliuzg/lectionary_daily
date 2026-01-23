import React from 'react';
import { parseReference } from './lib/references';

interface Verse {
  uvid: number;
  ref: string;
  verse: number;
  text: string;
}

interface ScriptureRendererProps {
  reference: string;
  type: string;
  text?: string;
  verses?: Verse[];
  onReferenceClick?: (ref: string) => void;
}

export function ScriptureRenderer({
  reference,
  type,
  text,
  verses,
  onReferenceClick
}: ScriptureRendererProps) {
  const handleRefClick = (e: React.MouseEvent, ref: string) => {
    e.preventDefault();
    onReferenceClick?.(ref);
  };

  const renderContent = () => {
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
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--rcl-secondary);
          margin-bottom: 0.35rem;
        }
        
        .scripture-reference {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.5rem;
          font-weight: 500;
          color: var(--rcl-text);
          margin: 0;
        }
        
        .scripture-text {
          font-family: 'Newsreader', Georgia, serif;
          font-size: 1.125rem;
          line-height: 1.85;
          color: var(--rcl-text);
        }

        .verse-block {
          margin: 0;
        }
        
        .verse-number {
          font-family: 'Cabin', system-ui, sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--rcl-secondary);
          opacity: 0.8;
          vertical-align: super;
          margin-right: 0.35em;
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
  // Simple reference pattern for cross-references
  const refPattern = /\b([1-3]?\s?[A-Z][a-z]+(?:\s+of\s+[A-Z][a-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?\b/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = refPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

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

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 1 && typeof parts[0] === 'string') {
    return parts[0].split('\n\n').map((para, i) => (
      <p key={i} style={{ marginBottom: '1.25em' }}>{para}</p>
    ));
  }

  return parts;
}


export default ScriptureRenderer;
