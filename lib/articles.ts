import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Article, ArticleFrontmatter, ArticleWithContent } from './types';

const ARTICLES_DIR = path.join(process.cwd(), 'content', 'articles');

/**
 * Get plain-text excerpt from MDX content (first paragraph, no markdown).
 */
function extractExcerpt(content: string, maxLen = 180): string {
  // Remove MDX/JSX tags, markdown headers, frontmatter artifacts
  const clean = content
    .replace(/^---[\s\S]*?---/m, '')
    .replace(/<[^>]+>/g, '')        // remove JSX tags
    .replace(/#{1,6}\s+/g, '')       // remove headings
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // bold/italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // links
    .replace(/\n{2,}/g, '\n')
    .trim();

  const firstPara = clean.split('\n').find(l => l.trim().length > 30) || '';
  return firstPara.length > maxLen ? firstPara.slice(0, maxLen).replace(/\s+\S*$/, '') + '…' : firstPara;
}

/**
 * Read and parse a single MDX file.
 */
function parseArticleFile(slug: string): ArticleWithContent | null {
  const filePath = path.join(ARTICLES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const fm = data as ArticleFrontmatter;

  return {
    slug,
    title: fm.title || slug,
    deck: fm.deck,
    kicker: fm.kicker || '',
    category: fm.category || '',
    date: fm.date || '',
    byline: fm.byline || '',
    dateline: fm.dateline,
    readtime: fm.readtime,
    summary: fm.summary || [],
    images: fm.images || [],
    videos: fm.videos || [],
    excerpt: extractExcerpt(content),
    content,
  };
}

/**
 * Get all article slugs from the content directory.
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(ARTICLES_DIR)) return [];
  return fs
    .readdirSync(ARTICLES_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''));
}

/**
 * Get all articles (frontmatter + excerpt only, no content).
 */
export function getAllArticles(): Article[] {
  return getAllSlugs()
    .map(slug => {
      const parsed = parseArticleFile(slug);
      if (!parsed) return null;
      const { content: _content, ...article } = parsed;
      void _content;
      return article;
    })
    .filter((a): a is Article => a !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get a single article by slug, including full MDX content.
 */
export function getArticleBySlug(slug: string): ArticleWithContent | null {
  return parseArticleFile(slug);
}

/**
 * Get articles indexed by slug for quick lookup.
 */
export function getArticleMap(): Record<string, Article> {
  const articles = getAllArticles();
  return Object.fromEntries(articles.map(a => [a.slug, a]));
}
