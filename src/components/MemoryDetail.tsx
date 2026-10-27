import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Heart, MapPin, Pencil, Star, Trash2, X } from 'lucide-react';
import type { TravelMemory } from '../types';
import { destinationById } from '../data/destinations';
import { DestinationImage, LocalPhoto, ModalFrame, PrimaryButton } from './ui';

export function MemoryDetail({ memory, onClose, onEdit, onDelete }: { memory: TravelMemory; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const destination = destinationById(memory.destinationId);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightbox(false);
      if (!lightbox || !memory.photos.length) return;
      if (event.key === 'ArrowRight') setPhotoIndex((index) => (index + 1) % memory.photos.length);
      if (event.key === 'ArrowLeft') setPhotoIndex((index) => (index - 1 + memory.photos.length) % memory.photos.length);
    };
    window.addEventListener('keydown', handle); return () => window.removeEventListener('keydown', handle);
  }, [lightbox, memory.photos.length]);
  return <>
    <ModalFrame title={memory.title} eyebrow="A JOURNEY, KEPT" onClose={onClose} className="memory-detail-modal">
      <div className="memory-detail-cover">
        {memory.photos[0] ? <LocalPhoto id={memory.photos[0].id} alt={memory.title} /> : <DestinationImage src={destination?.image} alt={destination?.name ?? 'Karnataka destination'} />}
        <div className="memory-cover-shade" /><div className="memory-cover-meta"><span><CalendarDays size={15} />{new Date(`${memory.visitDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span><span><MapPin size={15} />{destination?.name ?? 'Karnataka'}</span></div>
        <h2>{memory.title}</h2>
        {memory.photos.length > 1 && <button className="memory-gallery-open" onClick={() => setLightbox(true)}><span>{memory.photos.length} photographs</span><ArrowRight size={15} /></button>}
      </div>
      <div className="memory-detail-content">
        {memory.caption && <p className="memory-detail-caption">{memory.caption}</p>}
        {memory.favouriteMoment && <blockquote><Heart size={16} fill="currentColor" /><span><small>THE MOMENT THAT STAYED</small>{memory.favouriteMoment}</span></blockquote>}
        {memory.story && <div className="memory-full-story">{memory.story.split('\n').map((paragraph, index) => paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />)}</div>}
        <div className="memory-detail-meta">
          {memory.rating && <span>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={14} fill={index < memory.rating! ? 'currentColor' : 'none'} />)}</span>}
          {memory.companions && <span>Alongside {memory.companions}</span>}
        </div>
        <div className="tag-picker saved-tags">{memory.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        {memory.photos.length > 1 && <div className="memory-detail-gallery">{memory.photos.map((photo, index) => <button key={photo.id} onClick={() => { setPhotoIndex(index); setLightbox(true); }}><LocalPhoto id={photo.id} alt={`${memory.title}, photograph ${index + 1}`} /></button>)}</div>}
        <div className="memory-detail-footer"><button className="text-action" onClick={onDelete}><Trash2 size={15} /> Delete memory</button><div><button className="button button-outline" onClick={onEdit}><Pencil size={15} /> Edit Memory</button><PrimaryButton variant="dark" onClick={onClose}>Close story</PrimaryButton></div></div>
      </div>
    </ModalFrame>
    <AnimatePresence>{lightbox && memory.photos.length > 0 && <motion.div className="lightbox-backdrop" role="dialog" aria-modal="true" aria-label="Travel photographs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button className="lightbox-close" onClick={() => setLightbox(false)} aria-label="Close photo viewer"><X size={23} /></button>
      {memory.photos.length > 1 && <button className="lightbox-nav lightbox-prev" onClick={() => setPhotoIndex((index) => (index - 1 + memory.photos.length) % memory.photos.length)} aria-label="Previous photo"><ChevronLeft size={26} /></button>}
      <div className="lightbox-image"><LocalPhoto id={memory.photos[photoIndex].id} alt={`${memory.title}, photograph ${photoIndex + 1}`} /></div>
      {memory.photos.length > 1 && <button className="lightbox-nav lightbox-next" onClick={() => setPhotoIndex((index) => (index + 1) % memory.photos.length)} aria-label="Next photo"><ChevronRight size={26} /></button>}
      <div className="lightbox-caption">{memory.title}<span>{photoIndex + 1} / {memory.photos.length}</span></div>
    </motion.div>}</AnimatePresence>
  </>;
}

export function MemoryCard({ memory, image, destination, onOpen, onEdit, onDelete }: { memory: TravelMemory; image?: string; destination: string; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  return <article className="memory-card">
    <button className="memory-card-image" onClick={onOpen} aria-label={`Read ${memory.title}`}>
      {memory.photos[0] ? <LocalPhoto id={memory.photos[0].id} alt={memory.title} /> : <DestinationImage src={image} alt={destination} />}
      <span>{new Date(`${memory.visitDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      {memory.photos.length > 1 && <i>+{memory.photos.length - 1}</i>}
    </button>
    <div className="memory-card-body"><span className="eyebrow"><MapPin size={12} />{destination}</span><h3><button onClick={onOpen}>{memory.title}</button></h3>
      {memory.caption && <p>{memory.caption}</p>}{memory.favouriteMoment && <blockquote>“{memory.favouriteMoment}”</blockquote>}
      <div className="memory-card-footer"><button className="text-action" onClick={onOpen}>Read story <ArrowRight size={14} /></button><div><button aria-label="Edit memory" onClick={onEdit}><Pencil size={14} /></button><button aria-label="Delete memory" onClick={onDelete}><Trash2 size={14} /></button></div></div>
    </div>
  </article>;
}
