import { ArrowUpRight, CalendarDays, Check, Clock3, Heart, MapPin, Plus, Route } from 'lucide-react';
import type { Destination, TravelMemory } from '../types';
import { DestinationImage, ModalFrame, PrimaryButton } from './ui';
import { destinations } from '../data/destinations';

export function DestinationDetail({ destination, favorite, visited, memories, onClose, onFavorite, onVisited, onAddTrip, onMemory, onViewMemory }: {
  destination: Destination; favorite: boolean; visited: boolean; memories: TravelMemory[];
  onClose: () => void; onFavorite: () => void; onVisited: () => void; onAddTrip: () => void;
  onMemory: () => void; onViewMemory: (memory: TravelMemory) => void;
}) {
  const photoCount = memories.reduce((sum, memory) => sum + memory.photos.length, 0);
  return <ModalFrame title={destination.name} eyebrow="A PLACE TO REMEMBER" onClose={onClose} className="destination-detail-modal">
    <div className="detail-hero-photo"><DestinationImage src={destination.image} alt={`${destination.name}, Karnataka`} />
      <div className="detail-hero-shade" /><div className="detail-image-label"><MapPin size={15} /> {destination.district}, Karnataka</div>
      <div className="detail-hero-text"><span>{destination.region}</span><h2>{destination.name}</h2>{destination.kannada && <p>{destination.kannada}</p>}</div>
      <button className={`detail-favorite ${favorite ? 'is-favorite' : ''}`} onClick={onFavorite} aria-label="Toggle favourite"><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></button>
    </div>
    <div className="detail-content">
      <div className="detail-quickfacts"><span><Clock3 size={16} />{destination.duration}</span><span><Route size={16} />{destination.category}</span><span>₹{destination.budgetMin.toLocaleString('en-IN')}–{destination.budgetMax.toLocaleString('en-IN')} <small>approx.</small></span></div>
      <p className="detail-description">{destination.description}</p>
      {destination.storyTitle && destination.story && <div className="destination-story"><span className="eyebrow">A little about the place</span><h3>{destination.storyTitle}</h3><p>{destination.story}</p></div>}
      <div className="detail-highlights"><span className="eyebrow">Make room for</span><div>{destination.highlights.map((highlight) => <span key={highlight}>{highlight}</span>)}</div></div>
      <div className="detail-actions-row">
        <PrimaryButton variant="dark" onClick={onAddTrip}><Plus size={16} /> Add to My Trip</PrimaryButton>
        <PrimaryButton variant={visited ? 'terracotta' : 'outline'} onClick={onVisited}><Check size={16} />{visited ? 'Visited' : 'Mark as Visited'}</PrimaryButton>
        <PrimaryButton variant="light" onClick={onMemory}><CalendarDays size={16} />{memories.length ? 'Add a Memory' : 'Save a Memory'}</PrimaryButton>
      </div>
      {memories.length > 0 && <div className="place-memories"><span className="eyebrow">Your memories · {memories.length} stories · {photoCount} photos</span>
        <div className="place-memory-list">{memories.slice(0, 3).map((memory) => <button key={memory.id} onClick={() => onViewMemory(memory)}><span><b>{memory.title}</b><small>{new Date(`${memory.visitDate}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small></span><ArrowUpRight size={16} /></button>)}</div>
      </div>}
    </div>
  </ModalFrame>;
}

export function PlacePicker({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return <select value={selected} onChange={(event) => onSelect(event.target.value)}>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name}</option>)}</select>;
}
