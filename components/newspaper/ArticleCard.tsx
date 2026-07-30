import type { HydratedArticleSlot } from '@/lib/types';

interface ArticleCardProps {
  slot: HydratedArticleSlot;
}

const SIZE_CLASSES: Record<string, string> = {
  xl: 'h-xl',
  lg: 'h-lg',
  md: 'h-md',
  sm: 'h-sm',
  xs: 'h-xs',
  inline: 'h-xs',
};

const CLAMP_CLASSES: Record<number, string> = {
  3: 'clamp-3', 4: 'clamp-4', 5: 'clamp-5', 6: 'clamp-6',
  7: 'clamp-7', 8: 'clamp-8', 10: 'clamp-10', 12: 'clamp-12',
};

export default function ArticleCard({ slot }: ArticleCardProps) {
  const { article, size, slot: pos, showPhoto, photoVariant, photoLabel,
    bodyClamp = 6, crossref, hasBorder } = slot;

  const hClass = SIZE_CLASSES[size] || 'h-md';
  const clampClass = CLAMP_CLASSES[bodyClamp] || 'clamp-6';

  const posStyle: React.CSSProperties = {
    top: pos.top, left: pos.left, width: pos.width, height: pos.height,
  };
  if (hasBorder) {
    (posStyle as React.CSSProperties & { border: string }).border = '1px solid var(--rule-light)';
  }

  // Inline variant: single-line teaser
  if (size === 'inline') {
    return (
      <article
        className="article"
        data-article={article.slug}
        style={{ ...posStyle, paddingTop: 10 }}
      >
        <span className="kicker" style={{ display: 'inline', marginRight: 8 }}>
          {article.kicker}
        </span>
        <span className="body-text" style={{ fontStyle: 'italic' }}>
          {article.deck || article.excerpt}
        </span>
        <div className="read-hint" style={{ bottom: 6 }}>Read ▸</div>
      </article>
    );
  }

  return (
    <article
      className="article"
      data-article={article.slug}
      style={posStyle}
    >
      {article.kicker && <div className="kicker">{article.kicker}</div>}

      {/* Headline */}
      <h2 className={hClass}>{article.title}</h2>

      {/* Deck (only for larger articles) */}
      {article.deck && (size === 'xl' || size === 'lg') && (
        <p className="deck">{article.deck}</p>
      )}

      {/* Photo placeholder */}
      {showPhoto && photoVariant && (
        <figure className={`photo ${photoVariant}`}>
          {photoLabel && <span className="p-label">{photoLabel}</span>}
        </figure>
      )}

      {/* Byline */}
      {article.byline && (size !== 'xs') && (
        <>
          <div className="h-rule" />
          <div className="byline">{article.byline}</div>
        </>
      )}

      {/* Body excerpt */}
      {bodyClamp > 0 && (
        <p className={`body-text ${clampClass}`}>
          {article.dateline && (
            <span className="dateline">{article.dateline}:&nbsp;</span>
          )}
          {article.excerpt}
        </p>
      )}

      {/* Cross-reference */}
      {crossref && <div className="crossref">{crossref}</div>}

      {/* Read hint (appears on hover via CSS) */}
      <div className="read-hint">Read ▸</div>
    </article>
  );
}
