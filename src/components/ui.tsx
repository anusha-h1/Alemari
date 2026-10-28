import { useEffect, useRef, useState, type ImgHTMLAttributes, type ReactNode } from 'react';
import { Compass, MapPin, Heart, Check, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Destination } from '../types';
import { getPhoto } from '../services/storage';

export function BrandMark({ light = false }: { light?: boolean }) {
  return <a href="#home" className={`brand-lockup ${light ? 'brand-light' : ''}`} aria-label="ALEMARI home">
    <span className="brand-symbol"><Compass size={23} strokeWidth={1.55} /><i /></span>
    <span className="brand-word"><strong>ALEMARI</strong><small>ಅಲೆಮಾರಿ</small></span>
  </a>;
}

export function LocalPhoto({ id, alt, className = '', fallback = '/images/destinations/hampi.jpg' }: { id?: string; alt: string; className?: string; fallback?: string }) {
  const [src, setSrc] = useState(id ? '' : fallback);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!id) { setSrc(fallback); return; }
    let url = '';
    let live = true;
    getPhoto(id).then((blob) => { if (live && blob) { url = URL.createObjectURL(blob); setSrc(url); } else if (live) setSrc(fallback); }).catch(() => live && setSrc(fallback));
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, [id, fallback]);
  return <img className={className} src={failed ? fallback : (src || fallback)} alt={alt} loading="lazy" onError={() => { if (!failed) setFailed(true); }} />;
}

export function DestinationImage({ src, alt, className = '', onError, loading = 'lazy', fetchPriority, ...props }: ImgHTMLAttributes<HTMLImageElement> & { src?: string }) {
  const [failed, setFailed] = useState(!src);
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => setFailed(!src), [src]);
  useEffect(() => { if (imageRef.current && fetchPriority) imageRef.current.fetchPriority = fetchPriority; }, [fetchPriority]);
  return <img {...props} ref={imageRef} className={`${className} ${failed ? 'destination-image-placeholder' : ''}`} src={failed ? '/logo.svg' : src} alt={failed ? `${alt} — photograph unavailable; ALEMARI compass mark shown` : alt} loading={loading} onError={(event) => { onError?.(event); if (!failed) setFailed(true); }} />;
}

export function SectionHeading({ eyebrow, title, subtitle, centered = false }: { eyebrow: string; title: string; subtitle?: string; centered?: boolean }) {
  return <div className={`section-heading ${centered ? 'section-heading-centered' : ''}`}>
    <span className="eyebrow"><i />{eyebrow}</span><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}
  </div>;
}

export function PrimaryButton({ children, variant = 'dark', className = '', ...props }: { children: ReactNode; variant?: 'dark' | 'light' | 'outline' | 'terracotta'; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>;
}

export function IconButton({ label, active = false, children, onClick, className = '' }: { label: string; active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return <button type="button" className={`icon-button ${active ? 'is-active' : ''} ${className}`} aria-label={label} aria-pressed={active} title={label} onClick={(event) => { event.stopPropagation(); onClick?.(); }}>{children}</button>;
}

export function DestinationCard({ destination, favorite, visited, selected, onFavorite, onVisited, onExplore, onAddTrip, compact = false }: {
  destination: Destination; favorite: boolean; visited: boolean; selected?: boolean; compact?: boolean;
  onFavorite: () => void; onVisited: () => void; onExplore: () => void; onAddTrip: () => void;
}) {
  return <motion.article layout whileHover={{ y: -5 }} transition={{ duration: .24 }} className={`destination-card ${compact ? 'destination-card-compact' : ''} ${selected ? 'destination-card-selected' : ''}`}>
    <button className="destination-image-button" onClick={onAddTrip} aria-label={`Plan a trip to ${destination.name}`}>
      <DestinationImage src={destination.image} alt={`${destination.name}, ${destination.region}`} />
      <span className="image-location"><MapPin size={13} />{destination.district}</span>
      <span className="image-plan-callout"><ArrowUpRight size={12} />Plan a trip</span>
      {visited && <span className="visited-ribbon"><Check size={13} /> Been there</span>}
    </button>
    <div className="destination-card-body">
      <div className="card-topline"><span className="category-label">{destination.category}</span><IconButton label={favorite ? `Remove ${destination.name} from favourites` : `Add ${destination.name} to favourites`} active={favorite} onClick={onFavorite}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></IconButton></div>
      <h3>{destination.name}{destination.kannada && <span className="kannada-inline">{destination.kannada}</span>}</h3>
      <p className="destination-copy">{destination.description}</p>
      <div className="destination-meta"><span>{destination.duration}</span><b>·</b><span>₹{destination.budgetMin.toLocaleString('en-IN')}–{destination.budgetMax.toLocaleString('en-IN')}</span></div>
      <div className="card-actions">
        <button className="text-action" onClick={onExplore}>Explore details <ArrowUpRight size={15} /></button>
        <div className="card-mini-actions"><IconButton label={`Add ${destination.name} to a trip`} onClick={onAddTrip}><span className="add-trip-plus">+</span></IconButton><IconButton label={visited ? `Mark ${destination.name} unvisited` : `Mark ${destination.name} as visited`} active={visited} onClick={onVisited}><Check size={16} /></IconButton></div>
      </div>
    </div>
  </motion.article>;
}

export function ModalFrame({ title, eyebrow, onClose, children, className = '' }: { title: string; eyebrow?: string; onClose: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey); document.body.classList.add('modal-open');
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('modal-open'); };
  }, [onClose]);
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.section role="dialog" aria-modal="true" aria-label={title} className={`modal-panel ${className}`} initial={{ opacity: 0, y: 20, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .99 }} transition={{ duration: .22 }}>
      <div className="modal-topline">{eyebrow && <span className="eyebrow">{eyebrow}</span>}<button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button></div>
      <h2 className="modal-title">{title}</h2>{children}
    </motion.section>
  </motion.div>;
}
