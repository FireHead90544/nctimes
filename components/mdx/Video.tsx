'use client';

import { useState } from 'react';

interface VideoProps {
  src?: string;
  caption?: string;
  label?: string;
  thumbnail?: string;
}

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?\s]+)/);
  return match ? match[1] : null;
}

/**
 * <Video> — lazy-load YouTube iframe or video element.
 * Clicking the play button loads the actual video.
 */
export default function Video({ src, caption, label, thumbnail }: VideoProps) {
  const [active, setActive] = useState(false);

  const ytId = src ? getYouTubeId(src) : null;

  return (
    <div className="modal-video">
      <div className="video-embed" onClick={() => setActive(true)} role="button" tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setActive(true)}>
        {active && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
            allow="autoplay; fullscreen"
            allowFullScreen
            title={label || 'Video'}
          />
        ) : active && src ? (
          <video src={src} controls autoPlay style={{ width: '100%', height: '100%' }} />
        ) : (
          <>
            {thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .7 }} />
            )}
            <div className="video-play" aria-label="Play video">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A1A1A">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            {label && <span className="v-label">{label}</span>}
          </>
        )}
      </div>
      {caption && <div className="video-caption">{caption}</div>}
    </div>
  );
}
