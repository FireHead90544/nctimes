interface CoverPageProps {
  variant: 'front' | 'back';
  siteName?: string;
  tagline?: string;
  edition?: string;
  author?: string;
  siteUrl?: string;
}

export default function CoverPage({
  variant,
  siteName = 'THE NC TIMES',
  tagline = 'A Portfolio, Typeset Like A Newspaper',
  edition = 'Vol. I · No. 1 · Est. 2026',
  author = 'Nikhil Chandra — Growth Consultant',
  siteUrl = 'www.thenctimes.in',
}: CoverPageProps) {
  const isFront = variant === 'front';

  return (
    <div
      className="cover"
      data-cover={variant}
    >
      <div className="cv-vol">{edition}</div>
      <div className="mono">NC</div>
      <h2>{siteName.split(' ').map((w, i) => (
        <span key={i}>{w}&nbsp;</span>
      ))}</h2>
      <p className="cv-tag">{tagline}</p>
      <div className="cv-cta">
        {isFront ? 'Open To Begin Reading ▸' : '↺ Back To The Front Page'}
      </div>
      <div className="cv-foot">
        {isFront ? author : siteUrl}
      </div>
    </div>
  );
}
