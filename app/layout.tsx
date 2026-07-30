import type { Metadata } from 'next';
import { Playfair_Display, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import siteJSON from '@/content/site.json';

const playfair = Playfair_Display({
  variable: '--font-headline-loaded',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  variable: '--font-body-loaded',
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const ibmPlex = IBM_Plex_Mono({
  variable: '--font-meta-loaded',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: siteJSON.name,
    template: `%s | ${siteJSON.name}`,
  },
  description: siteJSON.description,
  openGraph: {
    type: 'website',
    siteName: siteJSON.name,
    title: siteJSON.name,
    description: siteJSON.description,
    url: siteJSON.url,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteJSON.name,
    description: siteJSON.description,
  },
  keywords: ['consultant', 'growth strategy', 'Nikhil Chandra', 'portfolio', 'business growth'],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSerif.variable} ${ibmPlex.variable}`}>
      <body>{children}</body>
    </html>
  );
}
