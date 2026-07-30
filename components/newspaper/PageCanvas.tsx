import type { HydratedPageLayout, InfoboxPreset } from '@/lib/types';
import Masthead from './Masthead';
import PageHeader from './PageHeader';
import ArticleCard from './ArticleCard';
import Decoration from './Decoration';
import type { SiteConfig } from '@/lib/types';

interface PageCanvasProps {
  page: HydratedPageLayout;
  pageNumber: number;
  site: SiteConfig;
  infoboxPresets: Record<string, InfoboxPreset>;
}

export default function PageCanvas({
  page, pageNumber, site, infoboxPresets,
}: PageCanvasProps) {
  const isFrontPage = page.id === 'p1';

  return (
    <div className="page-canvas">
      {/* Front page gets the full masthead; interior pages get section header */}
      {isFrontPage ? (
        <Masthead site={site} />
      ) : (
        <PageHeader
          pageNum={pageNumber}
          section={page.section}
          siteName={site.name}
        />
      )}

      {/* Decoration elements (col-rules, infoboxes, quote-boxes, classifieds, colophon) */}
      {page.decorations.map((dec, i) => (
        <Decoration key={i} dec={dec} presets={infoboxPresets} />
      ))}

      {/* Article cards */}
      {page.articles.map((slot) => (
        <ArticleCard key={slot.slug} slot={slot} />
      ))}

      {/* Page folio */}
      <div className="page-folio">
        <span>{site.name}</span>
        <span>Page {pageNumber}</span>
      </div>
    </div>
  );
}
