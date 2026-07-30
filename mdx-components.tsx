import type { MDXComponents } from 'mdx/types';
import Photo from '@/components/mdx/Photo';
import Video from '@/components/mdx/Video';
import PullQuote from '@/components/mdx/PullQuote';
import Gallery from '@/components/mdx/Gallery';
import InfoBox from '@/components/mdx/InfoBox';

/**
 * This file is required by @next/mdx.
 * It maps MDX component names to React components.
 *
 * Custom components available in any .mdx file:
 *   <Photo src alt caption variant label />
 *   <Video src caption label thumbnail />
 *   <PullQuote cite>text</PullQuote>
 *   <Gallery>...</Gallery>
 *   <InfoBox title>...</InfoBox>
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom newspaper components
    Photo,
    Video,
    PullQuote,
    Gallery,
    InfoBox,
    // Default overrides (optional)
    ...components,
  };
}
