import createMDX from '@next/mdx';
import type { NextConfig } from 'next';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  // Note: remark/rehype plugins can cause serialization issues with Turbopack.
  // We use next-mdx-remote for MDX compilation in routes; @next/mdx is only
  // needed for the mdx-components.tsx registry and type support.
  options: {},
});

const nextConfig: NextConfig = {
  output: 'export',           // Full SSG
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactCompiler: true,
  images: {
    unoptimized: true,        // Required for SSG export
  },
};

export default withMDX(nextConfig);
