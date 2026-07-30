import type { ReactNode } from 'react';

interface PullQuoteProps {
  children: ReactNode;
  cite?: string;
}

export default function PullQuote({ children, cite }: PullQuoteProps) {
  return (
    <div className="modal-pullquote">
      <p>{children}</p>
      {cite && <cite>{cite}</cite>}
    </div>
  );
}
