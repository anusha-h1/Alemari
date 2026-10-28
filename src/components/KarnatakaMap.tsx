import { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Check, Heart, MapPin, Navigation2, Search, ExternalLink } from 'lucide-react';
import type { Destination } from '../types';
import { categories } from '../types';
import { karnatakaDistricts } from '../data/travelGuides';
import { districtAttractions, districtMapUrl } from '../data/districtAttractions';
import { DestinationImage, PrimaryButton } from './ui';

const karnatakaCenter: L.LatLngExpression = [14.25, 75.55];

function MapViewSync({ selected, districtCenter }: { selected?: Destination; districtCenter?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (selected) map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 9), { duration: 0.7 });
  }, [map, selected]);
  useEffect(() => {
    if (!selected && districtCenter) map.flyTo(districtCenter, 9, { duration: 0.7 });
  }, [map, selected, districtCenter]);
  useEffect(() => {
    const reset = () => map.flyTo(karnatakaCenter, 7, { duration: 0.7 });
    window.addEventListener('alemari-map-reset', reset);
    const timer = window.setTimeout(() => map.invalidateSize(), 120);
    return () => { window.removeEventListener('alemari-map-reset', reset); window.clearTimeout(timer); };
  }, [map]);
  return null;
}

function Pin({ destination, visited, selected, actionAccent, onSelect }: { destination: Destination; visited: boolean; selected: boolean; actionAccent: string; onSelect: (id: string) => void }) {
  const fill = visited || selected ? actionAccent : '#1C252C';
  return <CircleMarker center={[destination.lat, destination.lng]} radius={selected ? 10 : 7} pathOptions={{ color: '#F8F9FA', weight: selected ? 3 : 2, fillColor: fill, fillOpacity: 1 }} eventHandlers={{ click: () => onSelect(destination.id), mouseover: (event) => event.target.setStyle({ radius: 11 }), mouseout: (event) => event.target.setStyle({ radius: selected ? 10 : 7 }) }}>
    <Popup className="alemari-leaflet-popup" minWidth={230}>
      <div className="map-popup">
        <DestinationImage src={destination.image} alt={destination.name} />
        <span className="category-label">{destination.category}</span>
        <strong>{destination.name}{destination.kannada && <small>{destination.kannada}</small>}</strong>
        <p>{destination.district} · {destination.duration}</p>
        <p className="map-popup-description">{destination.description}</p>
        <button onClick={() => onSelect(destination.id)}>Open destination details <Navigation2 size={13} /></button>
      </div>
    </Popup>
  </CircleMarker>;
}

export function KarnatakaMap({ destinations, allDestinations, actionAccent, favorites, visited, selectedId, onlyVisited, onOnlyVisited, onSelect, onFavorite, onVisited, onAddTrip, onDetails, onAddMemory, onViewMemories, hasMemories }: {
  destinations: Destination[]; allDestinations: Destination[]; actionAccent: string; favorites: string[]; visited: string[]; selectedId: string; onlyVisited: boolean;
  onOnlyVisited: () => void; onSelect: (id: string) => void; onFavorite: (id: string) => void;
  onVisited: (id: string) => void; onAddTrip: (id: string) => void; onDetails: (id: string) => void; onAddMemory: (id: string) => void;
  onViewMemories: (id: string) => void; hasMemories: (id: string) => boolean;
}) {
  const [mapQuery, setMapQuery] = useState('');
  const [mapCategory, setMapCategory] = useState('All categories');
  const [district, setDistrict] = useState('');
  const [tileError, setTileError] = useState(false);
  const mapDestinations = useMemo(() => destinations.filter((destination) => {
    const isDistrictPlace = district && (destination.district === district || district === 'Bengaluru South' && destination.district.startsWith('Bengaluru South'));
    return isDistrictPlace || ((!mapQuery || `${destination.name} ${destination.district} ${destination.region}`.toLowerCase().includes(mapQuery.toLowerCase())) && (mapCategory === 'All categories' || destination.category === mapCategory));
  }), [destinations, mapQuery, mapCategory, district]);
  const selected = mapDestinations.find((destination) => destination.id === selectedId) ?? allDestinations.find((destination) => destination.id === selectedId);
  const guide = district ? districtAttractions[district] : undefined;
  const matchingDistrictPlaces = useMemo(() => guide?.attractions.map((attraction) => ({
    ...attraction,
    destination: allDestinations.find((destination) => destination.name.toLowerCase() === attraction.name.toLowerCase() && (destination.district === district || destination.district.startsWith(`${district} `)))
      ?? (district === 'Bengaluru South' ? allDestinations.find((destination) => destination.district.startsWith('Bengaluru South')) : undefined),
  })) ?? [], [guide, allDestinations, district]);
  return <div className="map-shell">
    <div className="map-toolbar">
      <span className="map-toolbar-title"><span className="map-live-dot" /> KARNATAKA, INDIA</span>
      <select className="map-district-select" value={district} onChange={(event) => { setDistrict(event.target.value); onSelect(''); }} aria-label="Choose a district to explore"><option value="">Choose district</option>{karnatakaDistricts.map((name) => <option key={name}>{name}</option>)}</select>
      <label className="map-search"><Search size={14} /><input value={mapQuery} onChange={(event) => setMapQuery(event.target.value)} placeholder="Find a place on the map" aria-label="Search map places" />{mapQuery && <button onClick={() => setMapQuery('')} aria-label="Clear map search">×</button>}</label>
      <select className="map-category-select" value={mapCategory} onChange={(event) => setMapCategory(event.target.value)} aria-label="Filter map by category"><option>All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select>
      <button className={`map-filter ${onlyVisited ? 'map-filter-active' : ''}`} onClick={onOnlyVisited}><Check size={14} /> Visited only</button>
    </div>
    <div className="map-display">
      <MapContainer center={karnatakaCenter} zoom={7} scrollWheelZoom className="leaflet-map" zoomControl>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' eventHandlers={{ tileerror: () => setTileError(true), load: () => setTileError(false) }} />
        <MapViewSync selected={selected} districtCenter={guide?.center} />
        {mapDestinations.map((destination) => <Pin key={destination.id} destination={destination} visited={visited.includes(destination.id)} selected={selectedId === destination.id} actionAccent={actionAccent} onSelect={onSelect} />)}
      </MapContainer>
      <div className="map-reset-wrap"><button className="map-reset" onClick={() => { setDistrict(''); onSelect(''); window.dispatchEvent(new CustomEvent('alemari-map-reset')); }} aria-label="Reset map to Karnataka">Reset view</button></div>
      {guide && <aside className="district-map-guide" aria-label={`${district} places to explore`}>
        <button className="district-guide-close" onClick={() => setDistrict('')} aria-label="Close district guide">×</button>
        <span className="district-guide-kicker"><MapPin size={12} /> DISTRICT GUIDE</span>
        <h3>{district}</h3>
        <p>Start with these places, then open the map for directions and current details.</p>
        <ol>{matchingDistrictPlaces.map((place) => <li key={place.name}>
          {place.destination ? <button className="district-place-link" onClick={() => onSelect(place.destination!.id)}><span><strong>{place.name}</strong><small>{place.kind}</small></span><Navigation2 size={14} /></button>
            : <a className="district-place-link" href={districtMapUrl(place.name, district)} target="_blank" rel="noreferrer"><span><strong>{place.name}</strong><small>{place.kind}</small></span><ExternalLink size={13} /></a>}
        </li>)}</ol>
        <a className="district-source-link" href={guide.source} target="_blank" rel="noreferrer">Karnataka Tourism guide <ExternalLink size={12} /></a>
        <small className="district-center-note">Map centered near the district headquarters.</small>
      </aside>}
      {selected && <aside className="map-detail-card">
        <button className="map-detail-close" onClick={() => onSelect('')} aria-label="Close destination details">×</button>
        <DestinationImage src={selected.image} alt={selected.name} />
        <div className="map-detail-content">
          <span className="category-label">{selected.category}</span><h3>{selected.name}</h3><p className="map-detail-district">{selected.district} · {selected.duration}</p>
          <p>{selected.description}</p>
          <span className="map-price">Approx. ₹{selected.budgetMin.toLocaleString('en-IN')}–₹{selected.budgetMax.toLocaleString('en-IN')}</span>
          <div className="map-detail-actions">
            <PrimaryButton variant="dark" onClick={() => onDetails(selected.id)}>Explore</PrimaryButton>
            <button className={`map-action-icon ${visited.includes(selected.id) ? 'is-on' : ''}`} onClick={() => onVisited(selected.id)} title="Mark visited"><Check size={16} /></button>
            <button className={`map-action-icon ${favorites.includes(selected.id) ? 'is-on' : ''}`} onClick={() => onFavorite(selected.id)} title="Toggle favorite"><Heart size={16} fill={favorites.includes(selected.id) ? 'currentColor' : 'none'} /></button>
            <button className="map-action-icon" onClick={() => onAddTrip(selected.id)} title="Add to trip"><span>＋</span></button>
            <button className="map-memory-link" onClick={() => onAddMemory(selected.id)}>Add memory</button>
            {hasMemories(selected.id) && <button className="map-memory-link" onClick={() => onViewMemories(selected.id)}>View memories</button>}
          </div>
        </div>
      </aside>}
      {tileError && <div className="map-tile-warning" role="status">Map tiles are temporarily unavailable. Destination actions remain accessible from Discover Places.</div>}
      <div className="map-legend"><span><i className="legend-dot legend-unvisited" /> To explore</span><span><i className="legend-dot legend-visited" /> Journeyed</span></div>
      <div className="map-scale-note"><MapPin size={12} /> Places across Karnataka</div>
    </div>
    <p className="map-note"><Search size={14} /> Select a marker or find a place in Discover Places. Pins use approximate destination coordinates; map tiles are provided by OpenStreetMap.</p>
  </div>;
}
