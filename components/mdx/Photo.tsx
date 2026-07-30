interface PhotoProps {
  src?: string;
  alt?: string;
  caption?: string;
  variant?: string;
  label?: string;
}

/**
 * <Photo> — newspaper-style figure.
 * If src is provided, renders an <img>. Otherwise uses the CSS gradient placeholder.
 */
export default function Photo({ src, alt = '', caption, variant = 'ph-a', label }: PhotoProps) {
  return (
    <figure className="modal-figure">
      <div className={`photo ${src ? '' : variant}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          label && <span className="p-label">{label}</span>
        )}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
