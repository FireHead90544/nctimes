import fs from 'fs';
import path from 'path';
import type {
  PageLayout,
  HydratedPageLayout,
  HydratedArticleSlot,
  InfoboxPreset,
} from './types';
import { getArticleMap } from './articles';

const PAGES_JSON = path.join(process.cwd(), 'content', 'pages.json');
const INFOBOXES_JSON = path.join(process.cwd(), 'content', 'infoboxes.json');

export function getRawPageLayouts(): PageLayout[] {
  const raw = fs.readFileSync(PAGES_JSON, 'utf-8');
  return JSON.parse(raw) as PageLayout[];
}

export function getInfoboxPresets(): Record<string, InfoboxPreset> {
  const raw = fs.readFileSync(INFOBOXES_JSON, 'utf-8');
  return JSON.parse(raw);
}

/**
 * Merges pages.json layout config with article frontmatter data.
 * Call server-side only (uses fs).
 */
export function getHydratedPageLayouts(): HydratedPageLayout[] {
  const layouts = getRawPageLayouts();
  const articleMap = getArticleMap();

  return layouts.map(page => {
    const articles: HydratedArticleSlot[] = page.articles
      .map(slot => {
        const article = articleMap[slot.slug];
        if (!article) {
          console.warn(`[pages.ts] No article found for slug: ${slot.slug}`);
          return null;
        }
        return { ...slot, article };
      })
      .filter((s): s is HydratedArticleSlot => s !== null);

    return {
      id: page.id,
      section: page.section,
      articles,
      decorations: page.decorations,
    };
  });
}
