import type { ReactNode } from 'react';

interface GalleryProps {
  children: ReactNode;
}

export default function Gallery({ children }: GalleryProps) {
  return (
    <div className="modal-gallery">
      {children}
    </div>
  );
}
