// ─────────────────────────────────────────────────
// Shared TypeScript types for TheNCTimes
// ─────────────────────────────────────────────────

export interface ArticleImage {
  src: string;
  alt: string;
  caption?: string;
  placement?: 'hero' | 'thumbnail' | 'gallery';
  variant?: 'ph-a' | 'ph-b' | 'ph-c' | 'ph-d' | 'ph-e';
  label?: string;
}

export interface ArticleVideo {
  src: string;
  caption?: string;
  label?: string;
  thumbnail?: string;
}

export interface ArticleFrontmatter {
  title: string;
  deck?: string;
  kicker: string;
  category: string;
  date: string;
  byline: string;
  dateline?: string;
  readtime?: string;
  summary?: string[];
  images?: ArticleImage[];
  videos?: ArticleVideo[];
}

export interface Article extends ArticleFrontmatter {
  slug: string;
  excerpt: string; // first ~150 chars of body text (plain)
}

export interface ArticleWithContent extends Article {
  content: string; // raw MDX string
}

// ─────────────────────────────────────────────────
// Layout / page config types (from pages.json)
// ─────────────────────────────────────────────────

export type HeadlineSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'inline';

export interface ArticleSlot {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PageArticleConfig {
  slug: string;
  slot: ArticleSlot;
  size: HeadlineSize;
  showPhoto?: boolean;
  photoVariant?: string;
  photoLabel?: string;
  bodyClamp?: number;
  crossref?: string;
  hasBorder?: boolean;
}

export type DecorationPreset = 'by-the-numbers' | 'revenue-chart' | 'classifieds' | 'colophon';

export interface DecorationConfig {
  type: 'col-rule' | 'infobox' | 'quote-box' | 'classifieds' | 'colophon';
  preset?: DecorationPreset;
  slot?: ArticleSlot;
  style?: string;
  // quote-box specific
  text?: string;
  cite?: string;
}

export interface PageLayout {
  id: string;
  section: string;
  articles: PageArticleConfig[];
  decorations: DecorationConfig[];
}

// Hydrated — article config merged with frontmatter
export interface HydratedArticleSlot extends PageArticleConfig {
  article: Article;
}

export interface HydratedPageLayout {
  id: string;
  section: string;
  articles: HydratedArticleSlot[];
  decorations: DecorationConfig[];
}

// ─────────────────────────────────────────────────
// Infobox presets (from infoboxes.json)
// ─────────────────────────────────────────────────

export interface StatItem {
  label: string;
  value: string;
}

export interface ChartBar {
  value: string;
  label: string;
  height: number;
}

export interface ClassifiedAd {
  label: string;
  text: string;
}

export interface InfoboxPreset {
  title?: string;
  type: 'stats' | 'chart' | 'classifieds' | 'colophon';
  items?: StatItem[];
  bars?: ChartBar[];
  ads?: ClassifiedAd[];
  text?: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  url: string;
  publine: string;
  edition: string;
  author: {
    name: string;
    role: string;
    location: string;
    email: string;
    linkedin: string;
    twitter: string;
  };
  nav: Array<{ label: string; page: number }>;
  stats: StatItem[];
}
