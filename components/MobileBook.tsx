'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

const DESIGN_W = 720;
const DESIGN_H = 980;

interface MobileBookProps {
  pages: ReactNode[];
}

export default function MobileBook({ pages }: MobileBookProps) {
  const [cur, setCur] = useState(0);
  const [sliding, setSliding] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const total = pages.length;

  // ── Scale to fill viewport ────────────────────────────────────
  const applyScale = useCallback(() => {
    if (!wrapRef.current) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / DESIGN_W, vh / DESIGN_H);
    const w = DESIGN_W * scale;
    const h = DESIGN_H * scale;
    const left = (vw - w) / 2;
    const top  = (vh - h) / 2;
    wrapRef.current.style.transform = `scale(${scale})`;
    wrapRef.current.style.transformOrigin = 'top left';
    wrapRef.current.style.left = `${left}px`;
    wrapRef.current.style.top  = `${top}px`;
    wrapRef.current.style.width  = `${DESIGN_W}px`;
    wrapRef.current.style.height = `${DESIGN_H}px`;
  }, []);

  useEffect(() => {
    applyScale();
    window.addEventListener('resize', applyScale);
    return () => window.removeEventListener('resize', applyScale);
  }, [applyScale]);

  // ── Slide animation ───────────────────────────────────────────
  const slideTo = useCallback((nextIdx: number, dir: 'left' | 'right') => {
    if (sliding || nextIdx < 0 || nextIdx >= total) return;
    const slot = slotRef.current;
    if (!slot) return;
    setSliding(true);
    slot.style.transition = 'transform .26s ease, opacity .26s ease';
    slot.style.transform = dir === 'left' ? 'translateX(-28px)' : 'translateX(28px)';
    slot.style.opacity = '0';

    setTimeout(() => {
      setCur(nextIdx);
      slot.style.transition = 'none';
      slot.style.transform = dir === 'left' ? 'translateX(28px)' : 'translateX(-28px)';
      slot.style.opacity = '0';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          slot.style.transition = 'transform .26s ease, opacity .26s ease';
          slot.style.transform = 'translateX(0)';
          slot.style.opacity = '1';
          setSliding(false);
        });
      });
    }, 270);
  }, [sliding, total]);

  const goNext = useCallback(() => slideTo(cur + 1, 'left'),  [cur, slideTo]);
  const goPrev = useCallback(() => slideTo(cur - 1, 'right'), [cur, slideTo]);

  // ── Touch swipe ───────────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onStart = (e: TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      if (touchStartX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      if (dx < -40) goNext();
      else if (dx >  40) goPrev();
      touchStartX.current = null;
    };
    wrap.addEventListener('touchstart', onStart, { passive: true });
    wrap.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      wrap.removeEventListener('touchstart', onStart);
      wrap.removeEventListener('touchend',   onEnd);
    };
  }, [goNext, goPrev]);

  // ── Keyboard nav ──────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector('.modal-overlay.open')) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  return (
    <>
      <div id="mobilePageWrap" ref={wrapRef} style={{ position: 'absolute' }}>
        <div id="mobileSlot" ref={slotRef}>
          {pages[cur]}
        </div>
      </div>

      {/* Minimal mobile arrows — only shown on mobile via CSS */}
      <button
        id="mPrevBtn"
        className={`m-nav-arrow${cur <= 0 ? ' disabled' : ''}`}
        onClick={goPrev}
        aria-label="Previous page"
        disabled={cur <= 0}
      >‹</button>

      <button
        id="mNextBtn"
        className={`m-nav-arrow${cur >= total - 1 ? ' disabled' : ''}`}
        onClick={goNext}
        aria-label="Next page"
        disabled={cur >= total - 1}
      >›</button>
    </>
  );
}
