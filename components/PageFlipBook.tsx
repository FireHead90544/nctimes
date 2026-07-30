'use client';

import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';

// ─── Page coordinate system ──────────────────────────────────────────────────
// All article layout is authored at DESIGN_W × DESIGN_H.
// At runtime we scale uniformly to fill the available slot.
// "Fill" = use the LARGER scale factor so content bleeds to slot edges,
//  then clip with overflow:hidden — no white gutters.
const DESIGN_W = 720;
const DESIGN_H = 980;
const FLIP_MS  = 950;

// How far (px) must the pointer move before we consider it a drag vs a click
const DRAG_THRESHOLD = 6;
// Outer zone of each page (fraction) where drag-to-flip is active
const FLIP_ZONE = 0.40;

type FlipDir = 'next' | 'prev';

interface DragState {
  dir:          FlipDir;
  startX:       number;
  startY:       number;
  pageW:        number;
  pageH:        number;
  didDrag:      boolean;   // true once moved past DRAG_THRESHOLD
  currentAngle: number;
}

// ─── useBookDims ─────────────────────────────────────────────────────────────
// Returns stable dimensions that fill the viewport.
function useBookDims(isSinglePage: boolean) {
  const [dims, setDims] = useState<{
    pageW: number; pageH: number;
    scaleX: number; scaleY: number;
  } | null>(null);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pageW = isSinglePage ? vw : Math.floor(vw / 2);
      const pageH = vh;
      // "cover" scale: fill the slot, clip overflow — no white edges
      const scaleX = pageW / DESIGN_W;
      const scaleY = pageH / DESIGN_H;
      setDims({ pageW, pageH, scaleX, scaleY });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [isSinglePage]);

  return dims;
}

// ─── ScaledPage ──────────────────────────────────────────────────────────────
// Renders a 720×980 page canvas scaled to fill a slot of (pageW × pageH).
// Uses non-uniform scale so there are ZERO white gutters.
function ScaledPage({
  pageW, pageH, scaleX, scaleY, children,
}: {
  pageW: number; pageH: number;
  scaleX: number; scaleY: number;
  children: ReactNode;
}) {
  return (
    <div style={{
      width: pageW, height: pageH,
      overflow: 'hidden',
      position: 'relative',
      background: 'var(--paper)',
    }}>
      <div style={{
        width:           DESIGN_W,
        height:          DESIGN_H,
        transform:       `scaleX(${scaleX}) scaleY(${scaleY})`,
        transformOrigin: 'top left',
        pointerEvents:   'auto', // articles inside must be clickable
        position:        'relative',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── PageFlipBook (desktop: two pages) ───────────────────────────────────────
function DesktopBook({ pages }: { pages: ReactNode[] }) {
  const [spread, setSpread]   = useState(0);
  const [leafDir, setLeafDir] = useState<FlipDir | null>(null);
  const numSpreads = Math.ceil(pages.length / 2);

  const leafRef         = useRef<HTMLDivElement>(null);
  const isAnimating     = useRef(false);
  const drag            = useRef<DragState | null>(null);
  const pendingFlip     = useRef<FlipDir | null>(null);
  const bookRef         = useRef<HTMLDivElement>(null);

  // dims for a half-page slot
  const dims = useBookDims(false);

  // ── Index helpers ───────────────────────────────────────────────
  const li = spread * 2;
  const ri = spread * 2 + 1;

  // While flipping "next", the right slot pre-loads the NEXT right page
  // (invisible under the leaf), so when the leaf vanishes it's already correct.
  const effLI = leafDir === 'prev'  ? Math.max(0, spread * 2 - 2) : li;
  const effRI = leafDir === 'next'  ? Math.min(pages.length - 1, spread * 2 + 3) : ri;
  const frontIdx = leafDir === 'next' ? ri  : li;
  const backIdx  = leafDir === 'next' ? spread * 2 + 2 : spread * 2 - 1;

  const inBounds = (i: number) => i >= 0 && i < pages.length;

  // ── Core flip animation ─────────────────────────────────────────
  const finishFlip = useCallback((dir: FlipDir) => {
    const leaf = leafRef.current;
    if (!leaf) return;
    const target = dir === 'next' ? -180 : 180;
    leaf.style.transition = `transform ${FLIP_MS}ms cubic-bezier(.42,.0,.38,1)`;
    leaf.style.transform  = `rotateY(${target}deg)`;
    const onEnd = () => {
      leaf.removeEventListener('transitionend', onEnd);
      setSpread(s =>
        dir === 'next' ? Math.min(s + 1, numSpreads - 1) : Math.max(s - 1, 0)
      );
      setLeafDir(null);
      isAnimating.current = false;
    };
    leaf.addEventListener('transitionend', onEnd, { once: true });
  }, [numSpreads]);

  const revertFlip = useCallback((fromAngle: number) => {
    const leaf = leafRef.current;
    if (!leaf) return;
    const ms = Math.max(200, Math.abs(fromAngle) / 180 * 400);
    leaf.style.transition = `transform ${ms}ms cubic-bezier(.3,0,.2,1)`;
    leaf.style.transform  = 'rotateY(0deg)';
    const onEnd = () => {
      leaf.removeEventListener('transitionend', onEnd);
      setLeafDir(null);
      isAnimating.current = false;
    };
    leaf.addEventListener('transitionend', onEnd, { once: true });
  }, []);

  // Programmatic flip (keyboard / nav) fires after React renders the leaf
  useEffect(() => {
    if (!leafDir || !pendingFlip.current) return;
    const dir = pendingFlip.current;
    pendingFlip.current = null;
    requestAnimationFrame(() => finishFlip(dir));
  }, [leafDir, finishFlip]);

  // ── Pointer handlers ────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimating.current || !dims) return;
    // Let article clicks, nav clicks, and any interactive element pass through
    const target = e.target as HTMLElement;
    if (target.closest('[data-article]'))      return;
    if (target.closest('[data-jump-spread]'))  return;
    if (target.closest('button, a, input'))   return;

    const rect = bookRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const totalW = dims.pageW * 2;
    const rightZoneStart = totalW - dims.pageW * FLIP_ZONE;
    const leftZoneEnd    = dims.pageW * FLIP_ZONE;

    let dir: FlipDir | null = null;
    if (x >= rightZoneStart && spread < numSpreads - 1) dir = 'next';
    else if (x <= leftZoneEnd && spread > 0)            dir = 'prev';
    if (!dir) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      dir, startX: e.clientX, startY: e.clientY,
      pageW: dims.pageW, pageH: dims.pageH,
      didDrag: false, currentAngle: 0,
    };
  }, [dims, spread, numSpreads]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (!d.didDrag) {
      if (dist < DRAG_THRESHOLD) return;
      // Confirmed drag — start the flip
      d.didDrag = true;
      isAnimating.current = true;
      setLeafDir(d.dir);
      // Prevent text selection and scroll now that we're confirmed dragging
      e.preventDefault();
    }

    if (!leafRef.current) return;
    let angle: number;
    if (d.dir === 'next') {
      const p = Math.max(0, Math.min(1, -dx / d.pageW));
      angle = -180 * p;
    } else {
      const p = Math.max(0, Math.min(1, dx / d.pageW));
      angle = 180 * p;
    }
    d.currentAngle = angle;
    leafRef.current.style.transition = 'none';
    leafRef.current.style.transform  = `rotateY(${angle}deg)`;
  }, []);

  const onPointerUp = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;

    if (!d.didDrag) {
      // It was a plain click — do not flip, let the click event propagate naturally
      isAnimating.current = false;
      return;
    }

    if (Math.abs(d.currentAngle) / 180 > 0.28) {
      finishFlip(d.dir);
    } else {
      revertFlip(d.currentAngle);
    }
  }, [finishFlip, revertFlip]);

  const onPointerCancel = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (d?.didDrag) revertFlip(d.currentAngle);
    else isAnimating.current = false;
  }, [revertFlip]);

  // ── Keyboard nav ────────────────────────────────────────────────
  const flipProgrammatic = useCallback((dir: FlipDir) => {
    if (isAnimating.current) return;
    if (dir === 'next' && spread >= numSpreads - 1) return;
    if (dir === 'prev' && spread <= 0) return;
    isAnimating.current = true;
    pendingFlip.current = dir;
    setLeafDir(dir);
  }, [spread, numSpreads]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.querySelector('.modal-overlay.open')) return;
      if (e.key === 'ArrowRight') flipProgrammatic('next');
      if (e.key === 'ArrowLeft')  flipProgrammatic('prev');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flipProgrammatic]);

  useEffect(() => {
    const w = window as typeof window & { jumpToSpread?: (n: number) => void };
    w.jumpToSpread = (idx: number) => {
      if (isAnimating.current) return;
      setSpread(Math.max(0, Math.min(numSpreads - 1, idx)));
    };
  }, [numSpreads]);

  if (!dims) return null;
  const { pageW, pageH, scaleX, scaleY } = dims;
  const totalW = pageW * 2;

  const leafLeft   = leafDir === 'next' ? pageW : 0;
  const leafOrigin = leafDir === 'next' ? 'left center' : 'right center';

  const pageProps = { pageW, pageH, scaleX, scaleY };

  return (
    <div
      ref={bookRef}
      style={{
        position:    'relative',
        width:        totalW,
        height:       pageH,
        // Tighter perspective = more dramatic page curl
        perspective:  `${pageW * 1.8}px`,
        userSelect:   'none',
        touchAction:  'none',
        flexShrink:   0,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Left slot */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: pageW, height: pageH, overflow: 'hidden' }}>
        {inBounds(effLI) && <ScaledPage {...pageProps}>{pages[effLI]}</ScaledPage>}
      </div>

      {/* Spine shadow */}
      <div style={{
        position: 'absolute', top: 0, left: pageW - 2, width: 4, height: pageH,
        background: 'linear-gradient(90deg, rgba(0,0,0,.2) 0%, rgba(0,0,0,.04) 50%, rgba(0,0,0,.2) 100%)',
        zIndex: 5, pointerEvents: 'none',
      }} />

      {/* Right slot */}
      <div style={{ position: 'absolute', top: 0, left: pageW, width: pageW, height: pageH, overflow: 'hidden' }}>
        {inBounds(effRI) && <ScaledPage {...pageProps}>{pages[effRI]}</ScaledPage>}
      </div>

      {/* Corner drag hints */}
      {spread < numSpreads - 1 && (
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 0, right: 0, width: 52, height: 52,
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,.09) 50%)',
          zIndex: 6, pointerEvents: 'none',
        }} />
      )}
      {spread > 0 && (
        <div aria-hidden="true" style={{
          position: 'absolute', bottom: 0, left: 0, width: 52, height: 52,
          background: 'linear-gradient(225deg, transparent 50%, rgba(0,0,0,.09) 50%)',
          zIndex: 6, pointerEvents: 'none',
        }} />
      )}

      {/* Flipping leaf — only present when turning */}
      {leafDir && (
        <div
          ref={leafRef}
          style={{
            position:       'absolute',
            top:             0,
            left:            leafLeft,
            width:           pageW,
            height:          pageH,
            transformStyle:  'preserve-3d',
            transformOrigin: leafOrigin,
            transform:       'rotateY(0deg)',
            zIndex:           10,
            pointerEvents:   'none',
          }}
        >
          {/* Front face */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: leafDir === 'next'
                ? 'linear-gradient(to left, rgba(0,0,0,.18) 0%, rgba(0,0,0,.05) 30%, transparent 55%)'
                : 'linear-gradient(to right, rgba(0,0,0,.18) 0%, rgba(0,0,0,.05) 30%, transparent 55%)',
            }} />
            {inBounds(frontIdx) && <ScaledPage {...pageProps}>{pages[frontIdx]}</ScaledPage>}
          </div>

          {/* Back face */}
          <div style={{
            position: 'absolute', inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: leafDir === 'next'
                ? 'linear-gradient(to right, rgba(0,0,0,.18) 0%, rgba(0,0,0,.05) 30%, transparent 55%)'
                : 'linear-gradient(to left, rgba(0,0,0,.18) 0%, rgba(0,0,0,.05) 30%, transparent 55%)',
            }} />
            {inBounds(backIdx) && <ScaledPage {...pageProps}>{pages[backIdx]}</ScaledPage>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MobileBook (single page, swipe) ─────────────────────────────────────────
function MobileBook({ pages }: { pages: ReactNode[] }) {
  const [cur, setCur]         = useState(0);
  const [animating, setAnim]  = useState(false);
  const slotRef  = useRef<HTMLDivElement>(null);
  const touchX   = useRef<number | null>(null);
  const dims     = useBookDims(true);
  const total    = pages.length;

  const slideTo = useCallback((nextIdx: number, dir: 'left' | 'right') => {
    if (animating || nextIdx < 0 || nextIdx >= total) return;
    const slot = slotRef.current;
    if (!slot) return;
    setAnim(true);
    slot.style.transition = 'transform .24s ease, opacity .24s ease';
    slot.style.transform  = dir === 'left' ? 'translateX(-22px)' : 'translateX(22px)';
    slot.style.opacity    = '0';
    setTimeout(() => {
      setCur(nextIdx);
      slot.style.transition = 'none';
      slot.style.transform  = dir === 'left' ? 'translateX(22px)' : 'translateX(-22px)';
      slot.style.opacity    = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        slot.style.transition = 'transform .24s ease, opacity .24s ease';
        slot.style.transform  = 'translateX(0)';
        slot.style.opacity    = '1';
        setAnim(false);
      }));
    }, 250);
  }, [animating, total]);

  const goNext = useCallback(() => slideTo(cur + 1, 'left'),  [cur, slideTo]);
  const goPrev = useCallback(() => slideTo(cur - 1, 'right'), [cur, slideTo]);

  // Touch swipe
  useEffect(() => {
    const onStart = (e: TouchEvent) => { touchX.current = e.touches[0].clientX; };
    const onEnd   = (e: TouchEvent) => {
      if (touchX.current === null) return;
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (dx < -40) goNext();
      else if (dx > 40) goPrev();
      touchX.current = null;
    };
    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchend',   onEnd,   { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchend',   onEnd);
    };
  }, [goNext, goPrev]);

  if (!dims) return null;
  const { pageW, pageH, scaleX, scaleY } = dims;

  return (
    <>
      <div ref={slotRef} style={{ width: pageW, height: pageH }}>
        <ScaledPage pageW={pageW} pageH={pageH} scaleX={scaleX} scaleY={scaleY}>
          {pages[cur]}
        </ScaledPage>
      </div>

      {/* Swipe hint arrows — bottom corners, not intrusive */}
      {cur > 0 && (
        <button
          onClick={goPrev}
          aria-label="Previous page"
          style={{
            position: 'fixed', bottom: 24, left: 20, zIndex: 60,
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid rgba(0,0,0,.18)',
            background: 'rgba(247,244,236,.9)',
            fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,.15)',
          }}
        >‹</button>
      )}
      {cur < total - 1 && (
        <button
          onClick={goNext}
          aria-label="Next page"
          style={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 60,
            width: 36, height: 36, borderRadius: '50%',
            border: '1px solid rgba(0,0,0,.18)',
            background: 'rgba(247,244,236,.9)',
            fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,.15)',
          }}
        >›</button>
      )}
    </>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────
// Chooses Desktop or Mobile based on window width.
export default function PageFlipBook({ pages }: { pages: ReactNode[] }) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 880);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (isMobile === null) return null; // SSR / hydration

  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--paper)',
      }}>
        <MobileBook pages={pages} />
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--paper)',
    }}>
      <DesktopBook pages={pages} />
    </div>
  );
}
