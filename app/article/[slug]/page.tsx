import { getAllSlugs, getArticleBySlug } from '@/lib/articles';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import siteData from '@/content/site.json';
import { compileMDX } from 'next-mdx-remote/rsc';
import Photo from '@/components/mdx/Photo';
import Video from '@/components/mdx/Video';
import PullQuote from '@/components/mdx/PullQuote';
import Gallery from '@/components/mdx/Gallery';
import InfoBox from '@/components/mdx/InfoBox';

// Must be string paths for SSG
export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.deck || article.excerpt,
    openGraph: {
      title: article.title,
      description: article.deck || article.excerpt,
      type: 'article',
      publishedTime: article.date,
      authors: [article.byline],
      siteName: siteData.name,
    },
  };
}

const mdxComponents = { Photo, Video, PullQuote, Gallery, InfoBox };

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const { content } = await compileMDX({
    source: article.content,
    components: mdxComponents,
    options: { parseFrontmatter: true },
  });

  const formattedDate = new Date(article.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="article-page">
      <div className="article-page-inner">
        {/* Header */}
        <header className="article-page-header">
          <div className="article-page-topbar">
            <Link href="/" className="article-page-back">← Back to TheNCTimes</Link>
            <span className="article-page-date">{formattedDate.toUpperCase()}</span>
          </div>
          {article.kicker && (
            <div className="kicker" style={{ marginBottom: 10 }}>{article.kicker}</div>
          )}
          <h1 className="article-page-headline">{article.title}</h1>
          {article.deck && <p className="article-page-deck">{article.deck}</p>}
          <div className="article-page-byline">{article.byline}</div>
        </header>

        {/* Body + Sidebar */}
        <div className="article-page-content">
          <main className="article-page-body">
            {content}
          </main>

          <aside className="article-page-sidebar">
            {article.summary && article.summary.length > 0 && (
              <>
                <h4 style={{
                  font: '700 10.5px var(--font-meta)',
                  letterSpacing: '.07em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  marginBottom: 13,
                  paddingBottom: 8,
                  borderBottom: '1px solid var(--rule-light)',
                }}>Key Points</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {article.summary.map((point, i) => (
                    <li key={i} style={{
                      font: '400 12px/1.55 var(--font-body)',
                      marginBottom: 11,
                      paddingLeft: 15,
                      position: 'relative',
                    }}>
                      <span style={{
                        content: '■', color: 'var(--accent)', fontSize: 7,
                        position: 'absolute', left: 0, top: 5,
                      }}>■</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div style={{
              marginTop: 22, paddingTop: 15, borderTop: '1px dashed var(--rule-light)',
              font: '500 9.5px var(--font-meta)', letterSpacing: '.03em', color: '#888',
            }}>
              {article.readtime && (
                <div style={{ marginBottom: 6, textTransform: 'uppercase' }}>
                  Reading time: <b style={{ color: 'var(--ink)' }}>{article.readtime}</b>
                </div>
              )}
              {article.category && (
                <div style={{ textTransform: 'uppercase' }}>
                  Filed under: <b style={{ color: 'var(--ink)' }}>{article.category}</b>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
