interface PageHeaderProps {
  pageNum: number;
  section: string;
  siteName?: string;
}

export default function PageHeader({ pageNum, section, siteName = 'The NC Times' }: PageHeaderProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="page-header">
      <div className="ph-num">{pageNum}</div>
      <div className="ph-section">{section}</div>
      <div className="ph-meta">{siteName}&nbsp;|&nbsp;New Delhi&nbsp;|&nbsp;{today}</div>
    </div>
  );
}
