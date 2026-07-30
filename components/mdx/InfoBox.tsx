import type { ReactNode } from 'react';

interface InfoBoxProps {
  title?: string;
  children: ReactNode;
}

export default function InfoBox({ title, children }: InfoBoxProps) {
  return (
    <div className="modal-infobox">
      <div className="infobox">
        {title && <div className="infobox-head">{title}</div>}
        <div className="infobox-body">{children}</div>
      </div>
    </div>
  );
}
