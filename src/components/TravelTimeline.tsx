import { useMemo, useState } from 'react';
import { ArrowDownUp, CalendarDays, Heart, MapPin, Plus, SlidersHorizontal, Star } from 'lucide-react';
import { format } from 'date-fns';
import type { TravelMemory } from '../types';
import { categories } from '../types';
import { destinations, destinationById } from '../data/destinations';
import { DestinationImage, LocalPhoto } from './ui';

export function TravelTimeline({ memories, favorites, onOpen, onAdd }: { memories: TravelMemory[]; favorites: string[]; onOpen: (memory: TravelMemory) => void; onAdd: () => void }) {
  const [year, setYear] = useState('All years'); const [place, setPlace] = useState('All destinations'); const [category, setCategory] = useState('All categories'); const [favoritesOnly, setFavoritesOnly] = useState(false); const [ascending, setAscending] = useState(false);
  const years = [...new Set(memories.map((memory) => memory.visitDate.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  const sorted = useMemo(() => [...memories].filter((memory) => {
    const destination = destinationById(memory.destinationId);
    return (year === 'All years' || memory.visitDate.startsWith(year)) && (place === 'All destinations' || memory.destinationId === place) && (category === 'All categories' || destination?.category === category) && (!favoritesOnly || favorites.includes(memory.destinationId));
  }).sort((a, b) => ascending ? a.visitDate.localeCompare(b.visitDate) : b.visitDate.localeCompare(a.visitDate)), [memories, year, place, category, favoritesOnly, favorites, ascending]);

  return <div className="timeline-section">
    {memories.length > 0 && <div className="timeline-filters"><span className="timeline-filter-caption"><SlidersHorizontal size={15} /> Refine your story</span>
      <select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter timeline by year"><option>All years</option>{years.map((value) => <option key={value}>{value}</option>)}</select>
      <select value={place} onChange={(event) => setPlace(event.target.value)} aria-label="Filter timeline by destination"><option>All destinations</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select>
      <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter timeline by category"><option>All categories</option>{categories.map((value) => <option key={value}>{value}</option>)}</select>
      <button className={`timeline-favorite-filter ${favoritesOnly ? 'timeline-filter-active' : ''}`} onClick={() => setFavoritesOnly((value) => !value)} aria-pressed={favoritesOnly}><Heart size={14} fill={favoritesOnly ? 'currentColor' : 'none'} /> Favourites</button>
      <button className="timeline-sort" onClick={() => setAscending((value) => !value)}><ArrowDownUp size={15} />{ascending ? 'Oldest first' : 'Newest first'}</button>
    </div>}
    {memories.length > 0 && sorted.length === 0 && <div className="timeline-empty-filter"><p>No journeys match these filters. Adjust a filter to see more.</p><button className="text-action" onClick={() => { setYear('All years'); setPlace('All destinations'); setCategory('All categories'); setFavoritesOnly(false); }}>Clear filters</button></div>}
    {sorted.length > 0 ? <div className="journey-timeline">{sorted.map((memory, index) => {
      const destination = destinationById(memory.destinationId);
      return <article key={memory.id} className="timeline-entry"><div className="timeline-date-column"><span className="timeline-dot"><MapPin size={15} /></span><span>{format(new Date(`${memory.visitDate}T12:00:00`), 'MMM d')}</span><small>{format(new Date(`${memory.visitDate}T12:00:00`), 'yyyy')}</small></div>
        <button className="timeline-entry-card" onClick={() => onOpen(memory)}>
          <div className="timeline-entry-photo">{memory.photos[0] ? <LocalPhoto id={memory.photos[0].id} alt={memory.title} /> : <DestinationImage src={destination?.image} alt={destination?.name ?? 'Karnataka'} />}{memory.photos.length > 1 && <span>+{memory.photos.length - 1} photos</span>}</div>
          <div className="timeline-entry-content"><span className="eyebrow"><MapPin size={12} />{destination?.name ?? 'Karnataka'} · {destination?.category}</span><h3>{memory.title}</h3>{memory.caption && <p>{memory.caption}</p>}{memory.story && <p className="timeline-story-preview">{memory.story.slice(0, 150)}{memory.story.length > 150 ? '…' : ''}</p>}{memory.favouriteMoment && <blockquote><Star size={13} fill="currentColor" />{memory.favouriteMoment}</blockquote>}</div>
        </button>{index < sorted.length - 1 && <span className="timeline-connector" />}
      </article>;
    })}</div> : memories.length === 0 && <div className="timeline-empty"><span className="empty-compass"><MapPin size={26} /></span><span className="eyebrow">YOUR STORY IS WAITING</span><h3>Your next adventure could become your favourite memory.</h3><p>Start with a place you’ve already been. The smallest details make the best stories.</p><button className="button button-dark" onClick={onAdd}><Plus size={16} /> Add your first memory</button></div>}
    <p className="timeline-local-note"><CalendarDays size={14} />Your timeline is a private part of this browser.</p>
  </div>;
}
