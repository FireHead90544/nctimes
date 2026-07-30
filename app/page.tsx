import { getHydratedPageLayouts, getInfoboxPresets } from '@/lib/pages';
import { getAllArticles } from '@/lib/articles';
import PageFlipBook from '@/components/PageFlipBook';
import ArticleModal from '@/components/ArticleModal';
import PageCanvas from '@/components/newspaper/PageCanvas';
import siteData from '@/content/site.json';
import type { SiteConfig } from '@/lib/types';

export const dynamic = 'force-static';

const site = siteData as SiteConfig;

export default async function Home() {
  const layouts        = getHydratedPageLayouts();
  const infoboxPresets = getInfoboxPresets();
  const allArticles    = getAllArticles();

  // Pages array: [p1, p2, p3, p4]
  // Desktop spreads: [p1|p2], [p3|p4]
  // Mobile: single pages swiped through
  const renderedPages = layouts.map((page, i) => (
    <PageCanvas
      key={page.id}
      page={page}
      pageNumber={i + 1}
      site={site}
      infoboxPresets={infoboxPresets}
    />
  ));

  return (
    <>
      {/* SEO-visible article index — visually hidden */}
      <nav className="sr-article-index" aria-label="Article index">
        <h1>{site.name} — {site.author.name}</h1>
        <p>{site.tagline}</p>
        <ul>
          {allArticles.map(article => (
            <li key={article.slug}>
              <a href={`/article/${article.slug}`}>
                <strong>[{article.kicker}]</strong> {article.title}
              </a>
              {article.deck && <p>{article.deck}</p>}
              <p>{article.excerpt}</p>
            </li>
          ))}
        </ul>
      </nav>

      {/* Unified flipbook: desktop=two-page drag-to-turn, mobile=single-page swipe */}
      <PageFlipBook pages={renderedPages} />

      {/* Article detail modal */}
      <ArticleModal articlesJSON={allArticles} />
    </>
  );
}
