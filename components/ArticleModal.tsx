'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import type { Article } from '@/lib/types';

interface ArticleModalProps {
  /** All articles as JSON — injected server-side so no fetch needed */
  articlesJSON: Article[];
}

/**
 * ArticleModal — listens for clicks on [data-article] elements (event delegation),
 * shows the article in a modal, and pushes /article/[slug] to history.
 *
 * The modal renders from the pre-injected articlesJSON (no client fetch needed).
 * The detailed MDX body is loaded from /article/[slug] via fetch.
 */
export default function ArticleModal({ articlesJSON }: ArticleModalProps) {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const deckRef     = useRef<HTMLParagraphElement>(null);
  const bylineRef   = useRef<HTMLDivElement>(null);
  const kickerRef   = useRef<HTMLDivElement>(null);
  const dateRef     = useRef<HTMLDivElement>(null);
  const bodyRef     = useRef<HTMLDivElement>(null);
  const summaryRef  = useRef<HTMLUListElement>(null);
  const readtimeRef = useRef<HTMLElement>(null);
  const categoryRef = useRef<HTMLElement>(null);
  const currentSlugRef = useRef<string | null>(null);

  // Prev / next info — use state so React properly controls disabled / title
  type NavInfo = { slug: string; title: string } | null;
  const [prevInfo, setPrevInfo] = useState<NavInfo>(null);
  const [nextInfo, setNextInfo] = useState<NavInfo>(null);

  // Index articles by slug (built once on mount)
  const articleMap = useRef<Record<string, Article>>({});
  useEffect(() => {
    articlesJSON.forEach(a => { articleMap.current[a.slug] = a; });
  }, [articlesJSON]);

  const openModal = useCallback(async (slug: string) => {
    const article = articleMap.current[slug];
    if (!article || !overlayRef.current) return;

    currentSlugRef.current = slug;

    // ── Prev / next navigation ────────────────────────────────────
    const idx     = articlesJSON.findIndex(a => a.slug === slug);
    const prevArt = idx > 0                       ? articlesJSON[idx - 1] : null;
    const nextArt = idx < articlesJSON.length - 1 ? articlesJSON[idx + 1] : null;
    // Use setState so React properly enables/disables the buttons
    setPrevInfo(prevArt ? { slug: prevArt.slug, title: prevArt.title } : null);
    setNextInfo(nextArt ? { slug: nextArt.slug, title: nextArt.title } : null);

    // ── Fill header fields (DOM refs — no re-render cost) ─────────
    if (headlineRef.current) headlineRef.current.textContent = article.title;
    if (kickerRef.current)   kickerRef.current.textContent  = article.kicker;
    if (dateRef.current)     dateRef.current.textContent    = formatDate(article.date);
    if (bylineRef.current)   bylineRef.current.textContent  = article.byline;
    if (readtimeRef.current) readtimeRef.current.textContent = article.readtime ?? '3 min';
    if (categoryRef.current) categoryRef.current.textContent = article.category;

    // Deck
    if (deckRef.current) {
      deckRef.current.textContent   = article.deck ?? '';
      deckRef.current.style.display = article.deck ? 'block' : 'none';
    }

    // Summary bullets
    if (summaryRef.current) {
      summaryRef.current.innerHTML = '';
      (article.summary ?? []).forEach(b => {
        const li = document.createElement('li');
        li.textContent = b;
        summaryRef.current!.appendChild(li);
      });
    }

    // Body — fetch the rendered HTML from the article page
    if (bodyRef.current) {
      bodyRef.current.innerHTML = '<p style="opacity:.5;font-style:italic">Loading…</p>';
      try {
        const res  = await fetch(`/article/${slug}?modal=1`);
        const html = await res.text();
        const parser = new DOMParser();
        const doc    = parser.parseFromString(html, 'text/html');
        const body   = doc.querySelector('.article-page-body');
        if (body && bodyRef.current) {
          bodyRef.current.innerHTML = body.innerHTML;
        } else if (bodyRef.current) {
          bodyRef.current.innerHTML = `<p>${article.excerpt}</p>`;
        }
      } catch {
        if (bodyRef.current) bodyRef.current.innerHTML = `<p>${article.excerpt}</p>`;
      }
    }

    // Open overlay
    overlayRef.current.classList.add('open');
    document.body.style.overflow = 'hidden';
    history.pushState({ article: slug }, '', `/article/${slug}`);
  }, [articlesJSON]);

  const closeModal = useCallback(() => {
    if (!overlayRef.current?.classList.contains('open')) return;
    overlayRef.current.classList.remove('open');
    document.body.style.overflow = '';
    currentSlugRef.current = null;
    setPrevInfo(null);
    setNextInfo(null);
    if (window.location.pathname.startsWith('/article/')) {
      history.pushState({}, '', '/');
    }
  }, []);

  // ── Event delegation for article & nav clicks ─────────────────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Article card click
      const art = target.closest('[data-article]') as HTMLElement | null;
      if (art) {
        const slug = art.getAttribute('data-article');
        if (slug) { openModal(slug); return; }
      }

      // Masthead nav click (jump spread)
      const navItem = target.closest('[data-jump-spread]') as HTMLElement | null;
      if (navItem) {
        const idx = parseInt(navItem.getAttribute('data-jump-spread') ?? '0', 10);
        const w = window as typeof window & { jumpToSpread?: (n: number) => void };
        w.jumpToSpread?.(idx);
        return;
      }

      // Cover click
      const cover = target.closest('[data-cover]') as HTMLElement | null;
      if (cover) {
        const w = window as typeof window & { jumpToSpread?: (n: number) => void };
        const v = cover.getAttribute('data-cover');
        if (v === 'front') w.jumpToSpread?.(1);
        else w.jumpToSpread?.(0);
        return;
      }

      // Close modal
      if (target.closest('[data-close-modal]')) { closeModal(); return; }
      if (target === overlayRef.current) { closeModal(); return; }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [openModal, closeModal]);

  // ── Keyboard ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal]);

  // ── Popstate (browser back) ───────────────────────────────────────
  useEffect(() => {
    const onPop = () => {
      if (!window.location.pathname.startsWith('/article/')) closeModal();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [closeModal]);

  return (
    <div ref={overlayRef} className="modal-overlay" id="modalOverlay" role="presentation"
      onClick={e => { if (e.target === overlayRef.current) closeModal(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-headline-id">

        {/* Top bar */}
        <div className="modal-topbar">
          <div ref={kickerRef} className="mt-left" id="modalKicker">SECTION</div>
          <div className="mt-right">
            <div ref={dateRef} className="mt-date" id="modalDate" />
            <button className="modal-close" data-close-modal aria-label="Close article">×</button>
          </div>
        </div>

        {/* Article prev / next navigation strip — state-driven so disabled works */}
        <div className="modal-article-nav" role="navigation" aria-label="Article navigation">
          <button
            className="modal-nav-btn prev"
            aria-label={prevInfo ? `Previous: ${prevInfo.title}` : 'No previous article'}
            disabled={!prevInfo}
            onClick={() => prevInfo && openModal(prevInfo.slug)}
          >
            <span className="nav-arrow" aria-hidden="true">←</span>
            <span className="nav-text">
              <span className="nav-label">Previous</span>
              <span className="nav-title">{prevInfo?.title ?? ''}</span>
            </span>
          </button>

          <button
            className="modal-nav-btn next"
            aria-label={nextInfo ? `Next: ${nextInfo.title}` : 'No next article'}
            disabled={!nextInfo}
            onClick={() => nextInfo && openModal(nextInfo.slug)}
          >
            <span className="nav-text">
              <span className="nav-label">Next</span>
              <span className="nav-title">{nextInfo?.title ?? ''}</span>
            </span>
            <span className="nav-arrow" aria-hidden="true">→</span>
          </button>
        </div>

        {/* Headline block */}
        <div className="modal-headblock">
          <h1 ref={headlineRef} className="modal-headline" id="modal-headline-id">Headline</h1>
          <p   ref={deckRef}    className="modal-deck"     id="modalDeck" />
          <div ref={bylineRef}  className="modal-byline"   id="modalByline" />
        </div>

        {/* Content area */}
        <div className="modal-content-area">
          <div ref={bodyRef} className="modal-body" id="modalBody" />
          <aside className="modal-sidebar">
            <h4>Key Points</h4>
            <ul ref={summaryRef} id="modalSummary" />
            <div className="modal-meta-box">
              <div>Reading time: <b ref={readtimeRef} id="modalReadTime">3 min</b></div>
              <div>Filed under: <b ref={categoryRef} id="modalCategory">Career</b></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    }).toUpperCase();
  } catch {
    return dateStr;
  }
}
