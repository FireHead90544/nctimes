import type { SiteConfig } from '@/lib/types';

interface MastheadProps {
  site: SiteConfig;
}

export default function Masthead({ site }: MastheadProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="masthead">
      <div className="m-utility">
        <span>{new URL(site.url).hostname}</span>
        <span>{today}</span>
      </div>
      <div className="m-rule heavy" />
      <div className="m-publine">{site.publine}</div>
      <h1 className="m-title">{site.shortName.toUpperCase()}</h1>
      <div className="m-tagline">&ldquo;{site.tagline}&rdquo;</div>
      <div className="m-rule heavy" />
      <nav className="m-nav" aria-label="Sections">
      {site.nav.map((item) => {
        // Map 1-based page number to 0-based spread index
        // (pages are paired: [p1,p2]=spread0, [p3,p4]=spread1, ...)
        const spreadIdx = Math.floor((item.page - 1) / 2);
        return (
          <div
            key={item.label}
            className="m-nav-item"
            data-jump-spread={spreadIdx}
          >
            <span className="m-nav-label">{item.label}</span>
            <span className="m-nav-page">▸ Page {item.page}</span>
          </div>
        );
      })}
      </nav>
      <div className="m-rule thin" />
    </div>
  );
}
