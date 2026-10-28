import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowDown, ArrowDownRight, ArrowRight, ArrowUpRight, BookOpen, Bookmark, CalendarDays, Check,
  Baby, Compass, ExternalLink, Flower2, Footprints, Heart, Hotel, Image as ImageIcon, MapPin, Menu, Mountain, Navigation,
  Plus, Quote, Search, ShieldCheck, Sparkles, Star, Trees, Utensils, Waves, Wind, X,
} from 'lucide-react';
import { addDays, format } from 'date-fns';
import type { Category, Destination, PlannerPreferences, TravelMemory } from './types';
import { categories } from './types';
import { destinations, destinationById } from './data/destinations';
import { districtSearchUrl, karnatakaDistricts, tripPackages } from './data/travelGuides';
import { useTravelData } from './hooks/useTravelData';
import { KarnatakaMap } from './components/KarnatakaMap';
import { DestinationDetail } from './components/DestinationDetail';
import { TripWizard } from './components/TripWizard';
import { MemoryForm } from './components/MemoryForm';
import { MemoryCard, MemoryDetail } from './components/MemoryDetail';
import { TravelCalendar } from './components/TravelCalendar';
import { TravelTimeline } from './components/TravelTimeline';
import { AlemariChat } from './components/AlemariChat';
import { PhotoCredits } from './components/PhotoCredits';
import { BrandMark, DestinationCard, DestinationImage, PrimaryButton, SectionHeading } from './components/ui';
import './styles/global.css';
import './styles/palette.css';
import './styles/travel-guides.css';
import './styles/district-map.css';

const navItems = [
  ['discover', 'Discover places'], ['map', 'Karnataka map'], ['memories', 'My memories'], ['calendar', 'Travel journal'], ['assistant', 'Travel buddy'],
] as const;

const experienceTiles: { category: Category; image: string; icon: typeof Mountain; subtitle: string }[] = [
  { category: 'Mountains & Hills', image: 'kudremukh', icon: Mountain, subtitle: 'Above the cloudline' },
  { category: 'Beaches & Coast', image: 'gokarna', icon: Waves, subtitle: 'Where land meets tide' },
  { category: 'Waterfalls & Rivers', image: 'jog-falls', icon: Wind, subtitle: "Find the water's way" },
  { category: 'Heritage & Architecture', image: 'hampi', icon: Compass, subtitle: 'Stone keeps its stories' },
  { category: 'Temples & Spiritual', image: 'badami', icon: Flower2, subtitle: 'A quieter kind of journey' },
  { category: 'Wildlife & Nature', image: 'kabini', icon: Trees, subtitle: 'Follow the wild trail' },
  { category: 'Adventure & Trekking', image: 'dandeli', icon: Footprints, subtitle: 'Take the way out' },
  { category: 'Weekend Getaways', image: 'coorg', icon: CalendarDays, subtitle: 'A little time, well spent' },
  { category: 'Hidden Gems', image: 'belur', icon: Sparkles, subtitle: 'The softly spoken places' },
];

const actionAccents: Record<Category, string> = {
  'Mountains & Hills': '#4D7C72',
  'Beaches & Coast': '#287A91',
  'Waterfalls & Rivers': '#3276A3',
  'Heritage & Architecture': '#9C6A36',
  'Temples & Spiritual': '#9A5B72',
  'Wildlife & Nature': '#637D42',
  'Adventure & Trekking': '#BD5E45',
  'Weekend Getaways': '#78618F',
  'Hidden Gems': '#408176',
};

function App() {
  const store = useTravelData();
  const reduceMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All experiences');
  const [regionFilter, setRegionFilter] = useState('All regions');
  const [districtFilter, setDistrictFilter] = useState('All districts');
  const [budgetFilter, setBudgetFilter] = useState('Any budget');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [mapVisitedOnly, setMapVisitedOnly] = useState(false);
  const [detailDestination, setDetailDestination] = useState<Destination | null>(null);
  const [tripTarget, setTripTarget] = useState('');
  const [plannerDefaults, setPlannerDefaults] = useState<Partial<PlannerPreferences>>({});
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [memoryFormOpen, setMemoryFormOpen] = useState(false);
  const [memoryDate, setMemoryDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [editingMemory, setEditingMemory] = useState<TravelMemory | undefined>();
  const [openMemory, setOpenMemory] = useState<TravelMemory | null>(null);
  const [journalTab, setJournalTab] = useState<'calendar' | 'timeline'>('calendar');
  const [toast, setToast] = useState('');
  const [quickInterest, setQuickInterest] = useState<Category>('Mountains & Hills');
  const [quickBudget, setQuickBudget] = useState(6000);
  const [quickDays, setQuickDays] = useState(2);
  const [revealId, setRevealId] = useState('chikmagalur');
  const [surpriseNoMatch, setSurpriseNoMatch] = useState(false);
  const [surpriseClosest, setSurpriseClosest] = useState(false);
  const [surpriseApplied, setSurpriseApplied] = useState(false);
  const [surpriseRelaxed, setSurpriseRelaxed] = useState('');
  const syncPlannerPreferences = useCallback((preferences: PlannerPreferences) => {
    store.setPlannerPreferences(preferences);
    store.setAvailableDays(preferences.availableDays);
    store.setInterests(preferences.interests);
    setQuickDays(preferences.availableDays);
    setQuickInterest(preferences.interests[0] ?? 'Mountains & Hills');
    setQuickBudget(preferences.budget);
  }, [store.setPlannerPreferences, store.setAvailableDays, store.setInterests]);
  const toastTimer = useRef<number | undefined>(undefined);
  const mapSection = useRef<HTMLElement | null>(null);
  const discoverSection = useRef<HTMLElement | null>(null);

  const flash = (message: string) => {
    setToast(message); window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3400);
  };
  const scrollTo = (id: string) => {
    setMobileMenu(false);
    const target = document.getElementById(id);
    if (!target) return;
    const headerHeight = document.querySelector<HTMLElement>('.site-nav')?.getBoundingClientRect().height ?? 0;
    const sectionGap = id === 'discover' ? 46 : 18;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - sectionGap;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  useEffect(() => {
    const elements = navItems.filter(([id]) => id !== 'assistant').map(([id]) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .2, .45] });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (!store.ready) return;
    setQuickDays(store.preferences.availableDays);
    const savedInterest = categories.find((category) => store.preferences.interests.includes(category)) ?? store.preferences.planner.interests[0] ?? 'Mountains & Hills';
    setQuickInterest(savedInterest);
    setQuickBudget(store.preferences.planner.budget);
  }, [store.ready, store.preferences.availableDays, store.preferences.interests, store.preferences.planner.interests, store.preferences.planner.budget]);
  useEffect(() => {
    if (categoryFilter !== 'All experiences' && !categories.includes(categoryFilter as Category)) {
      setCategoryFilter('All experiences');
    }
  }, [categoryFilter]);

  const visibleDestinations = useMemo(() => destinations.filter((destination) => {
    const matchesQuery = !query || [destination.name, destination.kannada, destination.region, destination.district, destination.category, ...destination.tags].filter(Boolean).join(' ').toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter === 'All experiences' || destination.category === categoryFilter || (categoryFilter === 'Weekend Getaways' ? destination.tags.includes('weekend') : destination.tags.includes(categoryFilter.toLowerCase()));
    const matchesRegion = regionFilter === 'All regions' || destination.region === regionFilter || destination.district === regionFilter;
    const matchesDistrict = districtFilter === 'All districts' || destination.district === districtFilter || districtFilter === 'Bengaluru South' && destination.district.startsWith('Bengaluru South') || districtFilter === 'Ramanagara' && destination.district.startsWith('Bengaluru South');
    const matchesBudget = budgetFilter === 'Any budget' || (budgetFilter === 'Under ₹3,000' ? destination.budgetMin < 3000 : budgetFilter === '₹3,000–₹6,000' ? destination.budgetMin >= 3000 && destination.budgetMin <= 6000 : budgetFilter === '₹6,000–₹10,000' ? destination.budgetMin >= 6000 && destination.budgetMin <= 10000 : destination.budgetMin > 10000);
    return matchesQuery && matchesCategory && matchesRegion && matchesDistrict && matchesBudget && (!favoritesOnly || store.preferences.favorites.includes(destination.id));
  }), [query, categoryFilter, regionFilter, districtFilter, budgetFilter, favoritesOnly, store.preferences.favorites]);

  const mapDestinations = useMemo(() => destinations.filter((destination) => (!mapVisitedOnly || store.preferences.visited.includes(destination.id)) && (categoryFilter === 'All experiences' || destination.category === categoryFilter)), [mapVisitedOnly, store.preferences.visited, categoryFilter]);
  const sortedMemories = store.memories;
  const photosCount = store.memories.reduce((sum, memory) => sum + memory.photos.length, 0);
  const categoryCounts = destinations.filter((destination) => store.preferences.visited.includes(destination.id)).reduce<Record<string, number>>((counts, destination) => ({ ...counts, [destination.category]: (counts[destination.category] ?? 0) + 1 }), {});
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Find your first favourite';
  const memoryLeaders = store.memories.reduce<Record<string, number>>((counts, memory) => ({ ...counts, [memory.destinationId]: (counts[memory.destinationId] ?? 0) + 1 }), {});
  const favouriteDestination = destinations.find((destination) => destination.id === store.preferences.favorites[0]) ?? destinations.find((destination) => destination.id === Object.entries(memoryLeaders).sort((a, b) => b[1] - a[1])[0]?.[0]);
  const districtsCount = new Set(store.preferences.visited.map((id) => destinationById(id)?.district).filter(Boolean)).size;
  const catalogueDistrictCount = karnatakaDistricts.length;
  const selectedDistrictPlaces = districtFilter === 'All districts' ? [] : destinations.filter((destination) => destination.district === districtFilter || districtFilter === 'Bengaluru South' && destination.district.startsWith('Bengaluru South') || districtFilter === 'Ramanagara' && destination.district.startsWith('Bengaluru South'));
  const actionAccent = categoryFilter === 'All experiences' ? '#B3634C' : actionAccents[categoryFilter as Category] ?? '#B3634C';

  const openDestination = (id: string) => {
    const destination = destinationById(id); if (!destination) return;
    setSelectedId(id); setDetailDestination(destination);
  };
  const addToTrip = (id?: string, defaults?: Partial<PlannerPreferences>) => {
    const fallbackInterests = store.preferences.interests.length ? store.preferences.interests : store.preferences.planner.interests;
    const availableDays = Math.max(1, Math.min(10, Math.round(defaults?.availableDays ?? store.preferences.planner.availableDays)));
    const next: PlannerPreferences = {
      ...store.preferences.planner,
      ...(defaults ?? {}),
      ...(id ? { destinationId: id } : {}),
      availableDays,
      interests: defaults?.interests ?? fallbackInterests,
    };
    setPlannerDefaults(next); syncPlannerPreferences(next);
    setTripTarget(id ?? defaults?.destinationId ?? '');
    setPlannerOpen(true); setDetailDestination(null);
  };
  const planPackage = (focus: PlannerPreferences['tripFocus'], district?: string, interests?: string[]) => {
    const startingPlace = district ? destinations.find((destination) => destination.district === district || district === 'Bengaluru South' && destination.district.startsWith('Bengaluru South')) : undefined;
    const next: PlannerPreferences = {
      ...store.preferences.planner,
      destinationId: startingPlace?.id ?? 'surprise',
      tripFocus: focus,
      travellingWithChildren: focus === 'Family with kids',
      interests: (interests ?? []).filter((interest): interest is Category => categories.includes(interest as Category)),
      availableDays: Math.max(store.preferences.planner.availableDays, 2),
    };
    next.endDate = format(addDays(new Date(`${next.startDate}T12:00:00`), next.availableDays - 1), 'yyyy-MM-dd');
    setPlannerDefaults(next); syncPlannerPreferences(next); setTripTarget(startingPlace?.id ?? ''); setPlannerOpen(true);
  };
  const addMemory = (date = format(new Date(), 'yyyy-MM-dd'), destinationId?: string) => {
    setMemoryDate(date);
    if (destinationId) setSelectedId(destinationId);
    setEditingMemory(undefined); setMemoryFormOpen(true); setOpenMemory(null); setDetailDestination(null);
  };
  const openTimelineMemory = (memory: TravelMemory) => { setOpenMemory(memory); setDetailDestination(null); setMemoryFormOpen(false); };
  const editMemory = (memory: TravelMemory) => { setEditingMemory(memory); setMemoryDate(memory.visitDate); setMemoryFormOpen(true); setOpenMemory(null); };
  const removeMemory = async (memory: TravelMemory) => {
    if (!window.confirm(`Delete “${memory.title}” and its locally stored photos? This cannot be undone.`)) return;
    const ok = await store.deleteMemory(memory.id);
    if (ok) { setOpenMemory(null); flash('Memory removed from this browser.'); }
  };
  const saveMemory = async (memory: TravelMemory, files: { id: string; file: File }[], removed: string[]) => {
    const ok = await store.saveMemory(memory, files, removed);
    if (ok) {
      store.setVisited((current) => current.includes(memory.destinationId) ? current : [...current, memory.destinationId]);
      setEditingMemory(undefined); flash(editingMemory ? 'Your memory is updated in this browser.' : 'Your journey is safely remembered in this browser.');
    }
    return ok;
  };
  const mapSelect = (id: string) => {
    setSelectedId(id); if (id) setFavoritesOnly(false);
  };
  const fitsInterest = (destination: Destination) => quickInterest === 'Hidden Gems' ? destination.tags.includes('hidden gems') : destination.category === quickInterest;
  const surprise = () => {
    const matches = destinations.filter((destination) => fitsInterest(destination) && destination.days <= quickDays && destination.budgetMin <= quickBudget);
    if (!matches.length) { setSurpriseNoMatch(true); setSurpriseClosest(false); setSurpriseApplied(false); return; }
    const alternatives = matches.length > 1 ? matches.filter((destination) => destination.id !== revealId) : matches;
    const chosen = (alternatives.length ? alternatives : matches)[Math.floor(Math.random() * (alternatives.length || matches.length))];
    setRevealId(chosen.id); setSurpriseNoMatch(false); setSurpriseClosest(false); setSurpriseApplied(true); setSurpriseRelaxed('');
  };
  const showClosestSurprise = () => {
    const ranked = destinations.map((destination) => ({ destination, score: Number(fitsInterest(destination)) * 4 + Number(destination.days <= quickDays) * 3 + Number(destination.budgetMin <= quickBudget) * 3 }))
      .sort((a, b) => b.score - a.score || a.destination.name.localeCompare(b.destination.name));
    const chosen = ranked[0]?.destination;
    if (!chosen) return;
    const relaxed = [!fitsInterest(chosen) ? 'experience' : '', chosen.days > quickDays ? 'days available' : '', chosen.budgetMin > quickBudget ? 'budget' : ''].filter(Boolean);
    setRevealId(chosen.id); setSurpriseNoMatch(false); setSurpriseClosest(true); setSurpriseApplied(true); setSurpriseRelaxed(relaxed.join(', ') || 'one or more preferences');
  };
  const reveal = destinationById(revealId) ?? destinations[0];
  const tripTargetId = destinations.some((destination) => destination.id === tripTarget) ? tripTarget : undefined;

  const exportMetadata = () => {
    const payload = { app: 'ALEMARI', exportedAt: new Date().toISOString(), notice: 'Export contains metadata and photo references only, not your photo blobs.', memories: store.memories.map(({ id, destinationId, title, visitDate, caption, story, favouriteMoment, photos, rating, tags, companions, createdAt, updatedAt }) => ({ id, destinationId, title, visitDate, caption, story, favouriteMoment, photos, rating, tags, companions, createdAt, updatedAt })) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'alemari-memories.json'; anchor.click(); URL.revokeObjectURL(url); flash('Memory metadata exported as JSON.');
  };
  const clearLocalData = async () => {
    if (!window.confirm('Clear every memory, uploaded photo, saved trip, favourite, visited place, and travel preference from this browser? This cannot be undone.')) return;
    const ok = await store.clearAll();
    if (ok) { flash('This browser’s ALEMARI travel data has been cleared.'); setDetailDestination(null); setOpenMemory(null); }
  };

  return <div className="alemari-app" style={{ '--action-accent': actionAccent } as CSSProperties}>
    <header className="site-nav">
      <div className="nav-inner"><BrandMark />
        <nav className={`nav-links ${mobileMenu ? 'nav-links-open' : ''}`} aria-label="Main navigation">{navItems.map(([id, label]) => <button key={id} className={activeSection === id ? 'nav-link-active' : ''} onClick={() => { if (id === 'assistant') { setActiveSection(id); setMobileMenu(false); window.dispatchEvent(new Event('alemari-open-chat')); } else scrollTo(id); }}>{label}</button>)}</nav>
        <div className="nav-actions"><button className={`nav-favorite-shortcut ${favoritesOnly ? 'nav-favorite-on' : ''}`} onClick={() => { setFavoritesOnly((value) => !value); scrollTo('discover'); }} aria-label="Toggle favourite destinations"><Heart size={17} fill={favoritesOnly ? 'currentColor' : 'none'} /><span>{favoritesOnly ? 'Favourites' : 'My places'}</span></button><button className="nav-plan-button" onClick={() => addToTrip()}>Plan my trip <ArrowUpRight size={15} /></button><button className="mobile-menu-button" onClick={() => setMobileMenu((value) => !value)} aria-label={mobileMenu ? 'Close menu' : 'Open menu'}>{mobileMenu ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
    </header>

    <main>
      <section className="hero-section" id="home">
        <div className="hero-image-wrap"><DestinationImage className="hero-image" src="/images/destinations/jog-falls.jpg" alt="Jog Falls cascading through a forested gorge in Shivamogga district, Karnataka" loading="eager" fetchPriority="high" /><div className="hero-scrim" /></div>
        <div className="hero-topline"><span><Compass size={15} /> TRAVEL, AT YOUR OWN PACE</span><span className="hero-place-marker"><i /> KARNATAKA, INDIA</span></div>
        <motion.div className="hero-copy" initial={reduceMotion ? false : { opacity: 0, y: 23 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, delay: .12 }}>
          <span className="hero-kicker">A NOTE FROM THE SOUTH</span><h1>ನಿಮ್ಮ ಮುಂದಿನ ಪಯಣ<br />ಇಲ್ಲಿಂದ <em>ಆರಂಭ.</em></h1><p className="hero-translation">Your Next Adventure Starts Here.</p>
          <p className="hero-description">From misty mountains and golden beaches to ancient kingdoms and hidden waterfalls, discover Karnataka your way.</p>
          <div className="hero-actions"><button className="hero-button hero-button-cream" onClick={() => scrollTo('discover')}>Explore Karnataka <ArrowDownRight size={17} /></button><button className="hero-button hero-button-glass" onClick={() => addToTrip()}>Plan My Journey <Compass size={17} /></button><button className="hero-memory-link" onClick={() => scrollTo('memories')}>Relive My Memories <ArrowRight size={15} /></button></div>
        </motion.div>
        <div className="hero-side-note"><span>Jog Falls · Shivamogga</span><span className="hero-side-rule" /><small>14.2290° N&nbsp; 74.8113° E</small></div>
        <div className="hero-bottom">
          <label className="hero-search"><Search size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setCategoryFilter('All experiences'); }} onKeyDown={(event) => { if (event.key === 'Enter') scrollTo('discover'); }} placeholder="A place on your mind?" aria-label="Search Karnataka destinations" /><span>PRESS ENTER</span><button type="button" onClick={() => scrollTo('discover')} aria-label="Find a destination"><ArrowRight size={17} /></button></label>
          <div className="hero-quick-planner"><div><small>A SMALL PLAN FOR LATER</small><span>Start with a feeling</span></div><select value={quickInterest} onChange={(event) => { const value = event.target.value as Category; setQuickInterest(value); setSurpriseNoMatch(false); setSurpriseClosest(false); setSurpriseApplied(false); setSurpriseRelaxed(''); syncPlannerPreferences({ ...store.preferences.planner, interests: [value] }); }} aria-label="Choose trip interest">{categories.map((category) => <option key={category}>{category}</option>)}</select><select value={quickBudget} onChange={(event) => { setQuickBudget(Number(event.target.value)); syncPlannerPreferences({ ...store.preferences.planner, budget: Number(event.target.value) }); setSurpriseNoMatch(false); setSurpriseClosest(false); setSurpriseApplied(false); setSurpriseRelaxed(''); }} aria-label="Choose approximate budget">{![3000, 6000, 10000, 20000].includes(quickBudget) && <option value={quickBudget}>Saved ₹{quickBudget.toLocaleString('en-IN')}</option>}<option value={3000}>Under ₹3,000</option><option value={6000}>Around ₹6,000</option><option value={10000}>Around ₹10,000</option><option value={20000}>Up to ₹20,000</option></select><select value={quickDays} onChange={(event) => { const value = Number(event.target.value); setQuickDays(value); setSurpriseNoMatch(false); setSurpriseClosest(false); setSurpriseApplied(false); setSurpriseRelaxed(''); syncPlannerPreferences({ ...store.preferences.planner, availableDays: value, endDate: format(addDays(new Date(`${store.preferences.planner.startDate}T12:00:00`), value - 1), 'yyyy-MM-dd') }); }} aria-label="Choose trip length"><option value={1}>1 day</option><option value={2}>2 days</option><option value={3}>3 days</option><option value={5}>5 days</option></select><button onClick={() => addToTrip(undefined, { interests: [quickInterest], budget: quickBudget, availableDays: quickDays })}>Shape my trip <ArrowUpRight size={15} /></button></div>
        </div>
        <button className="hero-scroll-hint" onClick={() => scrollTo('discover')}><ArrowDown size={16} /><span>SCROLL TO DISCOVER</span></button>
      </section>

      <div className="ticker-band"><div className="ticker-inner"><span>ಹೊಸ ತಾಣಗಳು, ಹೊಸ ಅನುಭವಗಳು.</span><i>✳</i><span>DISCOVER KARNATAKA. EXPERIENCE MORE.</span><i>✳</i><span>ಪ್ರತಿ ಪಯಣವೂ ಒಂದು ಕಥೆ.</span><i>✳</i><span>KEEP EVERY MEMORY.</span></div></div>

      <section className="discover-section section-pad" id="discover" ref={discoverSection}>
        <div className="section-top-row"><SectionHeading eyebrow="A LAND OF MANY WORLDS" title="ಕರ್ನಾಟಕದ ಸೌಂದರ್ಯವನ್ನು ಅನ್ವೇಷಿಸಿ" subtitle="From misty mountains to ancient kingdoms and peaceful beaches, find the places that speak to your soul." /><div className="discover-side-note"><span>01 — {destinations.length.toString().padStart(2, '0')}</span><p>{catalogueDistrictCount} districts · {destinations.length} places<br />to begin a story.</p></div></div>
        <div className="experience-heading"><span className="eyebrow">CHOOSE YOUR KIND OF DAY</span><p>Where does your mind want to wander?</p></div>
        <div className="experience-rail">{experienceTiles.map((tile) => { const Icon = tile.icon; const img = destinations.find((destination) => destination.id === tile.image); return <button key={tile.category} className={`experience-tile ${categoryFilter === tile.category ? 'experience-tile-selected' : ''}`} onClick={() => { setCategoryFilter(categoryFilter === tile.category ? 'All experiences' : tile.category); setFavoritesOnly(false); }} aria-pressed={categoryFilter === tile.category} style={{ backgroundImage: `linear-gradient(180deg, transparent 18%, rgba(15,35,28,.75)), url('${img?.image}')` }}><span className="experience-icon"><Icon size={17} /></span><strong>{tile.category}</strong><small>{tile.subtitle}</small></button>; })}</div>
        <div className="package-planner-block"><div className="package-planner-heading"><span className="eyebrow">TRIPS THAT FIT YOUR GROUP</span><h3>Choose a route style. We’ll shape the days.</h3><p>Start with a Karnataka region, a mix of experiences, or who’s travelling.</p></div><div className="package-grid">{tripPackages.map((pack) => { const Icon = pack.icon === 'south' ? Mountain : pack.icon === 'north' ? Compass : pack.icon === 'coast' ? Waves : pack.icon === 'mix' ? Sparkles : pack.icon === 'kids' ? Baby : ShieldCheck; return <article className={`package-card package-card-${pack.icon}`} key={pack.focus}><span className="package-icon"><Icon size={18} /></span><span className="eyebrow">{pack.icon === 'safety' ? 'TRAVEL TOGETHER' : pack.icon === 'kids' ? 'FAMILY DAYS' : 'KARNATAKA ROUTE'}</span><h4>{pack.title}</h4><p>{pack.summary}</p><button onClick={() => planPackage(pack.focus, pack.district, pack.interests)}>Build this trip <ArrowUpRight size={15} /></button></article>; })}</div><div className="women-safety-card"><div><span className="package-icon"><ShieldCheck size={18} /></span><div><strong>Women’s group safety checklist</strong><p>Share the route and check-in times with a trusted contact; agree a meeting point; keep phones charged and offline maps ready; use registered transport and check local access before remote treks. These steps support a plan but cannot guarantee safety.</p></div></div><div className="safety-helplines"><a href="tel:112"><strong>112</strong><small>Emergency</small></a><a href="tel:181"><strong>181</strong><small>Women Helpline</small></a><a href="https://112.gov.in/" target="_blank" rel="noreferrer">Emergency response info <ExternalLink size={13} /></a></div></div></div>
        <div className="destination-explore-toolbar"><div><span className="eyebrow">A GOOD PLACE TO START</span><h3>{favoritesOnly ? 'Places you’ve kept close' : categoryFilter === 'All experiences' ? 'Find your kind of somewhere.' : categoryFilter}</h3></div>
          <div className="destination-filters"><label className="discover-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a place" aria-label="Search places" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</label>
            <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)} aria-label="Filter by region"><option>All regions</option>{[...new Set(destinations.map((destination) => destination.region))].map((region) => <option key={region}>{region}</option>)}</select>
            <select value={districtFilter} onChange={(event) => setDistrictFilter(event.target.value)} aria-label="Filter by district"><option>All districts</option>{karnatakaDistricts.map((district) => <option key={district}>{district}</option>)}</select>
            <select value={budgetFilter} onChange={(event) => setBudgetFilter(event.target.value)} aria-label="Filter by approximate budget"><option>Any budget</option><option>Under ₹3,000</option><option>₹3,000–₹6,000</option><option>₹6,000–₹10,000</option><option>Above ₹10,000</option></select>
          </div>
        </div>
        {districtFilter !== 'All districts' && <section className="district-explorer" aria-label={`${districtFilter} district guide`}><div className="district-explorer-copy"><span className="eyebrow"><MapPin size={13} /> DISTRICT FIELD GUIDE</span><h3>Explore {districtFilter}</h3><p>{selectedDistrictPlaces.length ? `${selectedDistrictPlaces.length} curated places across ${new Set(selectedDistrictPlaces.map((place) => place.category)).size} kinds of experience.` : 'We’re growing the curated place list for this district. Use these live map searches to discover current options nearby.'}</p><div className="district-category-chips">{[...new Set(selectedDistrictPlaces.map((place) => place.category))].map((category) => <span key={category}>{category}</span>)}</div><div className="district-place-links">{selectedDistrictPlaces.slice(0, 6).map((place) => <button key={place.id} onClick={() => openDestination(place.id)}>{place.name} <ArrowUpRight size={13} /></button>)}</div></div><div className="district-local-links"><span className="eyebrow">PLAN AROUND YOUR STAY</span><a href={districtSearchUrl('hotels', districtFilter)} target="_blank" rel="noreferrer"><Hotel size={17} /><span><b>Hotels & homestays</b><small>See current nearby listings</small></span><ExternalLink size={13} /></a><a href={districtSearchUrl('restaurants', districtFilter)} target="_blank" rel="noreferrer"><Utensils size={17} /><span><b>Restaurants & local food</b><small>Find meals and local eateries</small></span><ExternalLink size={13} /></a><a href={districtSearchUrl('things to do', districtFilter)} target="_blank" rel="noreferrer"><MapPin size={17} /><span><b>Nearby places & tour guides</b><small>Explore current local options</small></span><ExternalLink size={13} /></a><a href={districtSearchUrl('tour packages', districtFilter)} target="_blank" rel="noreferrer"><Compass size={17} /><span><b>Local tour packages</b><small>Compare operators for this area</small></span><ExternalLink size={13} /></a><button className="district-plan-button" onClick={() => planPackage('Any of Karnataka', districtFilter, ['Heritage & Architecture', 'Wildlife & Nature'])}>Plan a trip here <ArrowUpRight size={14} /></button></div></section>}
        <div className="filter-summary"><div className="category-chips"><button className={categoryFilter === 'All experiences' ? 'category-chip-active' : ''} onClick={() => setCategoryFilter('All experiences')}>All places <span>{destinations.length}</span></button>{categories.map((category) => <button key={category} className={categoryFilter === category ? 'category-chip-active' : ''} onClick={() => setCategoryFilter(category)}>{category}</button>)}</div><span>{visibleDestinations.length} places to discover</span></div>
        <motion.div className="destination-grid" layout>{visibleDestinations.map((destination) => <DestinationCard key={destination.id} destination={destination} favorite={store.preferences.favorites.includes(destination.id)} visited={store.preferences.visited.includes(destination.id)} selected={selectedId === destination.id} onFavorite={() => store.toggleFavorite(destination.id)} onVisited={() => { store.toggleVisited(destination.id); flash(store.preferences.visited.includes(destination.id) ? `${destination.name} removed from visited places.` : `${destination.name} marked as visited.`); }} onExplore={() => openDestination(destination.id)} onAddTrip={() => addToTrip(destination.id)} />)}</motion.div>
        {visibleDestinations.length === 0 && <div className="no-results"><Compass size={26} /><h3>No paths for that search.</h3><p>Try another place, district, or budget.</p><button className="text-action" onClick={() => { setQuery(''); setCategoryFilter('All experiences'); setRegionFilter('All regions'); setDistrictFilter('All districts'); setBudgetFilter('Any budget'); setFavoritesOnly(false); }}>Clear filters <ArrowRight size={14} /></button></div>}
        <div className="discover-more"><span>Curiosity looks good on you.</span><button onClick={() => scrollTo('map')}>See all these places on the map <ArrowRight size={16} /></button></div>
      </section>

      <section className="stories-section"><div className="stories-intro"><span className="eyebrow">NOT JUST PLACES. FEELINGS.</span><h2>Some journeys stay<br /><em>with you.</em></h2><p>Three ways into a landscape, a story, a slower afternoon. Pick the one that feels like yours.</p><button className="stories-map-link" onClick={() => scrollTo('map')}>Find your way around <ArrowDownRight size={16} /></button></div>
        {(['hampi', 'coorg', 'gokarna'] as const).map((id, index) => { const place = destinationById(id)!; return <motion.article key={id} className={`story-row story-row-${index + 1}`} initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .18 }} transition={{ duration: .5, delay: index * .08 }}>
          <button className="story-photo" onClick={() => openDestination(id)}><DestinationImage src={place.image} alt={`${place.name} destination, ${place.region}`} /><span>0{index + 1} / THE POSTCARD</span><i><ArrowUpRight size={20} /></i></button>
          <div className="story-copy"><span className="eyebrow">{place.region} · {place.category}</span><h3>{place.name}<small>{index === 0 ? 'Where history comes alive' : index === 1 ? 'Escape into the hills' : 'Find your coastal escape'}</small></h3><p>{place.story ?? place.description}</p><button className="text-action" onClick={() => openDestination(id)}>Explore this place <ArrowRight size={15} /></button></div>
        </motion.article>; })}
      </section>

      <section className="surprise-section"><div className="surprise-copy"><span className="eyebrow"><Sparkles size={14} /> A LITTLE UNPLANNED MAGIC</span><h2>Let Karnataka<br />choose <em>you.</em></h2><p>Tell us how many days you have and what you love. We’ll find a place that fits.</p><div className="surprise-options"><label>I'm drawn to<select value={quickInterest} onChange={(event) => { const value = event.target.value as Category; setQuickInterest(value); setSurpriseNoMatch(false); setSurpriseClosest(false); setSurpriseApplied(false); setSurpriseRelaxed(''); syncPlannerPreferences({ ...store.preferences.planner, interests: [value] }); }}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>I have<select value={quickDays} onChange={(event) => { const value = Number(event.target.value); setQuickDays(value); setSurpriseNoMatch(false); setSurpriseClosest(false); setSurpriseApplied(false); setSurpriseRelaxed(''); syncPlannerPreferences({ ...store.preferences.planner, availableDays: value, endDate: format(addDays(new Date(`${store.preferences.planner.startDate}T12:00:00`), value - 1), 'yyyy-MM-dd') }); }}><option value={1}>one day</option><option value={2}>two days</option><option value={3}>three days</option><option value={5}>five days</option></select></label><label>About ₹<input type="number" min="500" step="500" value={quickBudget} onChange={(event) => { setQuickBudget(Number(event.target.value) || 500); syncPlannerPreferences({ ...store.preferences.planner, budget: Number(event.target.value) || 500 }); setSurpriseNoMatch(false); setSurpriseClosest(false); setSurpriseApplied(false); setSurpriseRelaxed(''); }} /></label></div><PrimaryButton variant="light" onClick={surprise}>Surprise me <Sparkles size={16} /></PrimaryButton><span className="surprise-estimate-note">A local suggestion, matched to your preferences.</span></div>
        <motion.article key={surpriseNoMatch ? 'no-match' : reveal.id} className={`surprise-reveal ${surpriseNoMatch ? 'surprise-no-match' : ''}`} initial={reduceMotion ? false : { opacity: 0, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
          {surpriseNoMatch ? <div className="surprise-no-match-content"><Sparkles size={23} /><span className="eyebrow">NO EXACT MATCH THIS TIME</span><h3>Widen a choice, or find the closest fit.</h3><p>No place in this local sample meets your selected experience, available days, and budget at once. Your choices are still yours to change.</p><button onClick={showClosestSurprise}>Show the closest local fit <ArrowRight size={15} /></button></div> : <>
            <DestinationImage src={reveal.image} alt={`${reveal.name} in Karnataka`} />
            <div className="surprise-reveal-shade" />
            <span className="surprise-suitability"><Sparkles size={13} /> {surpriseClosest ? `CLOSEST LOCAL FIT · RELAXES ${surpriseRelaxed}` : surpriseApplied ? 'A PLACE THAT FITS YOUR CHOICES' : 'A PLACE TO DREAM ABOUT'}</span>
            <div className="surprise-place-copy"><span>{reveal.region}</span><h3>{reveal.name}<small>{reveal.kannada}</small></h3><p>{reveal.description}</p><p className="surprise-fit-reason">{surpriseClosest ? `Closest local match; relaxes: ${surpriseRelaxed}.` : `Matches your ${quickInterest.toLowerCase()} interest and ${quickDays}-day window; estimate starts around ₹${reveal.budgetMin.toLocaleString('en-IN')}, within your rough ₹${quickBudget.toLocaleString('en-IN')} limit.`}</p><div><span>{reveal.duration}</span><span>Approx. ₹{reveal.budgetMin.toLocaleString('en-IN')}–₹{reveal.budgetMax.toLocaleString('en-IN')}</span></div><div className="surprise-reveal-actions"><button onClick={surprise}>Another place <RefreshIcon /></button><button onClick={() => addToTrip(reveal.id)}>Add to my trip <ArrowUpRight size={15} /></button></div></div>
          </>}
        </motion.article>
      </section>

      <section className="map-section section-pad" id="map" ref={mapSection}><div className="section-top-row"><SectionHeading eyebrow="FIND YOUR BEARINGS" title="Karnataka, at a glance." subtitle={`${destinations.length} places across ${catalogueDistrictCount} districts. Each pin opens a real place and a new possibility.`} /><button className="map-filter-shortcut" onClick={() => { setMapVisitedOnly((value) => !value); }}>{mapVisitedOnly ? 'Show every place' : 'My Karnataka map'} <MapPin size={15} /></button></div>
        <KarnatakaMap destinations={mapDestinations} allDestinations={destinations} actionAccent={actionAccent} favorites={store.preferences.favorites} visited={store.preferences.visited} selectedId={selectedId} onlyVisited={mapVisitedOnly} onOnlyVisited={() => setMapVisitedOnly((value) => !value)} onSelect={mapSelect} onFavorite={(id) => store.toggleFavorite(id)} onVisited={(id) => store.toggleVisited(id)} onAddTrip={(id) => addToTrip(id)} onDetails={(id) => openDestination(id)} onAddMemory={(id) => addMemory(format(new Date(), 'yyyy-MM-dd'), id)} onViewMemories={(id) => { scrollTo('memories'); setJournalTab('timeline'); setTimeout(() => { const memory = sortedMemories.find((item) => item.destinationId === id); if (memory) openTimelineMemory(memory); }, 550); }} hasMemories={(id) => sortedMemories.some((memory) => memory.destinationId === id)} />
        <div className="map-context-row"><p><span>PINNED WITH INTENTION</span> Approximate destination coordinates on a real OpenStreetMap base layer. No invented state border.</p><button onClick={() => { setMapVisitedOnly(true); scrollTo('map'); }}>Show places I’ve been <ArrowRight size={15} /></button></div>
      </section>

      <section className="planner-teaser"><div className="planner-teaser-mark"><Compass size={42} strokeWidth={1} /><i /></div><div className="planner-teaser-copy"><span className="eyebrow">A ROUTE THAT IS YOURS</span><h2>Good travel starts<br />with a <em>good question.</em></h2><p>How many days? Who’s coming? What feels like the right amount to spend? Let’s begin there.</p><button onClick={() => addToTrip()}>Plan a trip around me <ArrowUpRight size={17} /></button></div><div className="planner-teaser-steps"><span><i>01</i> Choose your days and destination</span><span><i>02</i> Bring the things you love</span><span><i>03</i> Choose your budget and travel style</span><span><i>04</i> See a local itinerary take shape</span><small>Your estimate stays on this screen; no live booking or prices are connected.</small></div></section>

      <section className="memory-section section-pad" id="memories"><div className="section-top-row"><SectionHeading eyebrow="THE JOURNEY, KEPT CLOSE" title="ನನ್ನ ಪಯಣದ ನೆನಪುಗಳು" subtitle="Every destination has a story. Every journey leaves a memory." /><div className="memories-heading-actions"><button className="button button-outline" onClick={exportMetadata}><Bookmark size={15} /> Export memories</button><PrimaryButton onClick={() => addMemory()}><Plus size={16} /> Add memory</PrimaryButton></div></div>
        <div className="local-data-notice"><span className="notice-emblem"><BookOpen size={16} /></span><span><strong>A journal that stays yours.</strong> Stories and photos are stored in this browser only. Nothing syncs across devices or leaves your device.</span><button onClick={clearLocalData}>Clear local journal</button></div>
        {store.storageError && <p className="storage-warning" role="alert">{store.storageError}</p>}
        {store.ready ? <div className="memory-gallery">{sortedMemories.map((memory) => { const destination = destinationById(memory.destinationId); return <MemoryCard key={memory.id} memory={memory} image={destination?.image} destination={destination?.name ?? 'Karnataka'} onOpen={() => openTimelineMemory(memory)} onEdit={() => editMemory(memory)} onDelete={() => removeMemory(memory)} />; })}</div> : <div className="memory-loading" aria-busy="true"><span className="loading-pip" /> Getting your journal ready…<div className="memory-loading-skeletons" aria-hidden="true">{Array.from({ length: 3 }, (_, index) => <span className="memory-loading-card" key={index}><i /><b /><small /></span>)}</div></div>}
        {store.ready && store.memories.length === 0 && <div className="memory-empty"><div className="empty-journal-mark"><Quote size={23} /></div><span className="eyebrow">A FRESH PAGE</span><h3>A story begins somewhere.</h3><p>Start with the place that still comes back to you. Your photographs and notes stay in this browser.</p><PrimaryButton onClick={() => addMemory()}><Plus size={16} /> Write the first memory</PrimaryButton></div>}
      </section>

      <section className="calendar-section section-pad" id="calendar"><div className="section-top-row"><SectionHeading eyebrow="THE DATES THAT MATTER" title="Remember it by the day." subtitle="A quiet place to return to the moments that made the journey yours." /><div className="journal-mode-toggle"><button className={journalTab === 'calendar' ? 'journal-mode-active' : ''} onClick={() => setJournalTab('calendar')}><CalendarDays size={15} /> Calendar</button><button className={journalTab === 'timeline' ? 'journal-mode-active' : ''} onClick={() => setJournalTab('timeline')}><Navigation size={15} /> Timeline</button></div></div>
        {journalTab === 'calendar' ? <TravelCalendar memories={sortedMemories} onAdd={(date) => addMemory(date)} onOpen={openTimelineMemory} /> : <TravelTimeline memories={sortedMemories} favorites={store.preferences.favorites} onAdd={() => addMemory()} onOpen={openTimelineMemory} />}
      </section>

      <section className="profile-section section-pad" id="profile"><div className="profile-banner"><div className="profile-intro"><span className="eyebrow"><Compass size={14} /> YOUR KARNATAKA, YOUR WAY</span><h2>A traveller is made<br />of little <em>collections.</em></h2><p>This is what your journeys have gathered so far.</p><button onClick={() => { setMapVisitedOnly(true); scrollTo('map'); }}>My Karnataka map <ArrowRight size={15} /></button></div>
        <div className="profile-stats-grid"><article><span>01 / PLACES</span><strong>{store.preferences.visited.length}<small> places visited</small></strong><i><MapPin size={17} /></i></article><article><span>02 / STORIES</span><strong>{store.memories.length}<small> memories kept</small></strong><i><BookOpen size={17} /></i></article><article><span>03 / PHOTOGRAPHS</span><strong>{photosCount}<small> moments collected</small></strong><i><ImageIcon size={17} /></i></article><article><span>04 / DISTRICTS</span><strong>{districtsCount}<small> districts explored</small></strong><i><Navigation size={17} /></i></article><article><span>05 / FAVOURITE</span><strong className="profile-feature-value">{favouriteDestination?.name ?? 'A place is waiting'}</strong><i><Heart size={17} /></i></article><article><span>06 / YOUR WAY</span><strong className="profile-feature-value">{topCategory}</strong><i><Star size={17} /></i></article><article><span>07 / PLANS</span><strong>{store.trips.length}<small> trips saved</small></strong><i><Bookmark size={17} /></i></article><article className="profile-next-step"><span>THE NEXT PAGE</span><strong>Where to next?</strong><button onClick={() => addToTrip()}>Shape a journey <ArrowUpRight size={15} /></button></article></div>
      </div><div className="saved-trips-area"><div><span className="eyebrow">SAVED FOR ANOTHER DAY</span><h3>Your trip shelf</h3></div>{store.trips.length ? <div className="saved-trip-list">{store.trips.slice(0, 3).map((trip) => <article key={trip.id}><span className="saved-trip-icon"><Compass size={16} /></span><div><strong>{trip.title}</strong><small>{trip.days.length} days · est. ₹{trip.estimatedTotal.toLocaleString('en-IN')} · saved {format(new Date(trip.createdAt), 'MMM d')}</small></div><button onClick={() => addToTrip(trip.preferences.destinationId, trip.preferences)} aria-label="Plan this journey again"><ArrowUpRight size={16} /></button><button onClick={async () => { if (window.confirm(`Remove “${trip.title}” from this browser?`)) { const ok = await store.deleteTrip(trip.id); if (ok) flash('Saved trip removed.'); } }} aria-label="Delete saved trip"><X size={16} /></button></article>)}</div> : <div className="saved-trip-empty"><span>No itineraries saved yet.</span><button onClick={() => addToTrip()}>Make one, just for you <ArrowRight size={15} /></button></div>}</div></section>

      <section className="closing-section"><div className="closing-background"><DestinationImage src="/images/destinations/coorg.jpg" alt="Waterfall in Coorg among the green Western Ghats" /></div><div className="closing-content"><span className="eyebrow">UNTIL THE NEXT ROAD</span><p className="closing-kannada">ಪ್ರತಿ ಪಯಣವೂ ಒಂದು ಕಥೆ.</p><h2>Every journey deserves<br />to be <em>remembered.</em></h2><button onClick={() => scrollTo('discover')}>Find another place <ArrowUpRight size={16} /></button></div><span className="closing-edition">ALEMARI · KARNATAKA JOURNAL · Nº 01</span></section>
    </main>

    <footer className="site-footer"><div className="footer-main"><BrandMark light /><p>Discover Karnataka. Experience More.<br />Keep Every Memory.<small className="footer-tagline">ಪ್ರತಿ ಪಯಣವೂ ಒಂದು ಕಥೆ.<br />Every journey deserves to be remembered.</small></p><div className="footer-links">{navItems.slice(0, 4).map(([id, label]) => <button key={id} onClick={() => scrollTo(id)}>{label}</button>)}<PhotoCredits /></div><div className="footer-action"><span>YOUR NEXT CHAPTER IS OUT THERE.</span><button onClick={() => addToTrip()}>Plan my journey <ArrowUpRight size={15} /></button></div></div><div className="footer-baseline"><span>© ALEMARI · A SMALL FRONTEND-ONLY TRAVEL JOURNAL</span><span>IMAGERY SOURCES & LICENCES ARE CREDITED IN PHOTO CREDITS.</span><button onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}>BACK TO THE BEGINNING ↑</button></div></footer>

    <AlemariChat interests={store.preferences.interests} visited={store.preferences.visited} memories={store.memories} availableDays={store.preferences.availableDays} />
    <AnimatePresence>{toast && <motion.div className="toast-message" role="status" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}><Check size={16} />{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={14} /></button></motion.div>}</AnimatePresence>
    <AnimatePresence>{plannerOpen && <TripWizard key={`${tripTargetId ?? 'open'}-${plannerOpen}`} open={plannerOpen} initialDestinationId={tripTargetId} initialPreferences={plannerDefaults} onClose={() => setPlannerOpen(false)} onSave={store.saveTrip} onFavorite={store.setNewTripFavorites} onPreferencesChange={syncPlannerPreferences} />}</AnimatePresence>
    <AnimatePresence>{memoryFormOpen && <MemoryForm initialDate={memoryDate} editing={editingMemory} onClose={() => { setMemoryFormOpen(false); setEditingMemory(undefined); }} onSave={saveMemory} />}</AnimatePresence>
    <AnimatePresence>{detailDestination && <DestinationDetail destination={detailDestination} favorite={store.preferences.favorites.includes(detailDestination.id)} visited={store.preferences.visited.includes(detailDestination.id)} memories={sortedMemories.filter((memory) => memory.destinationId === detailDestination.id)} onClose={() => setDetailDestination(null)} onFavorite={() => store.toggleFavorite(detailDestination.id)} onVisited={() => store.toggleVisited(detailDestination.id)} onAddTrip={() => addToTrip(detailDestination.id)} onMemory={() => addMemory(format(new Date(), 'yyyy-MM-dd'), detailDestination.id)} onViewMemory={openTimelineMemory} />}</AnimatePresence>
    <AnimatePresence>{openMemory && <MemoryDetail memory={openMemory} onClose={() => setOpenMemory(null)} onEdit={() => editMemory(openMemory)} onDelete={() => removeMemory(openMemory)} />}</AnimatePresence>
  </div>;
}

function RefreshIcon() { return <span aria-hidden="true">↻</span>; }

export default App;
