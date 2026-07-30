import type { DecorationConfig, InfoboxPreset } from '@/lib/types';

/** Parses a CSS string like "left:245px; top:240px;" into a style object. */
function parseStyle(cssString: string): React.CSSProperties {
  const style: Record<string, string> = {};
  cssString.split(';').forEach(rule => {
    const [prop, val] = rule.split(':').map(s => s.trim());
    if (prop && val) {
      const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      style[camel] = val;
    }
  });
  return style as React.CSSProperties;
}

interface DecorationProps {
  dec: DecorationConfig;
  presets: Record<string, InfoboxPreset>;
}

export default function Decoration({ dec, presets }: DecorationProps) {
  const slotStyle: React.CSSProperties = dec.slot
    ? { top: dec.slot.top, left: dec.slot.left, width: dec.slot.width }
    : {};

  // Column rule
  if (dec.type === 'col-rule') {
    return <div className="col-rule" style={dec.style ? parseStyle(dec.style) : {}} />;
  }

  // Quote box
  if (dec.type === 'quote-box') {
    return (
      <div className="quote-box" style={{ ...slotStyle, height: dec.slot?.height }}>
        <p>{dec.text}</p>
        {dec.cite && <cite>{dec.cite}</cite>}
      </div>
    );
  }

  // Classifieds
  if (dec.type === 'classifieds') {
    const preset = presets['classifieds'];
    if (!preset || preset.type !== 'classifieds') return null;
    return (
      <div className="classifieds" style={slotStyle}>
        <h4>Classifieds</h4>
        {preset.ads?.map((ad, i) => (
          <div key={i} className="classified-ad">
            <b>{ad.label}</b>{ad.text}
          </div>
        ))}
      </div>
    );
  }

  // Colophon
  if (dec.type === 'colophon') {
    const preset = presets['colophon'];
    if (!preset || preset.type !== 'colophon') return null;
    return (
      <div className="colophon" style={slotStyle}>
        {preset.text}
      </div>
    );
  }

  // Infobox — stats or chart
  if (dec.type === 'infobox' && dec.preset) {
    const preset = presets[dec.preset];
    if (!preset) return null;

    return (
      <div className="infobox" style={{ ...slotStyle, height: dec.slot?.height }}>
        {preset.title && <div className="infobox-head">{preset.title}</div>}
        <div className="infobox-body">
          {preset.type === 'stats' && preset.items?.map((item, i) => (
            <div key={i} className="stat-row">
              <span>{item.label}</span>
              <span className="stat-num">{item.value}</span>
            </div>
          ))}
          {preset.type === 'chart' && preset.bars && (
            <div className="chart-bars">
              {preset.bars.map((bar, i) => (
                <div key={i} className="chart-bar" style={{ height: `${bar.height}%` }}>
                  <span>{bar.value}</span>
                  <em>{bar.label}</em>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
