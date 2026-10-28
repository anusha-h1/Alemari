import { useEffect, useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, Compass, Heart, MapPin, Minus, Plus, RefreshCw, Route, Sparkles, Wallet, X } from 'lucide-react';
import type { Category, PlannerPreferences, SavedTrip, TripFocus } from '../types';
import { destinations } from '../data/destinations';
import { buildItinerary, itineraryTotal, saveTripRecord } from '../services/itinerary';
import { requestItinerary } from '../services/api';
import { DestinationImage, ModalFrame, PrimaryButton } from './ui';

const interestGroups: { name: Category; summary: string; photoId: string }[] = [
  { name: 'Mountains & Hills', summary: 'High trails & fresh air', photoId: 'kudremukh' },
  { name: 'Beaches & Coast', summary: 'Coastal paths & sunsets', photoId: 'gokarna' },
  { name: 'Waterfalls & Rivers', summary: 'Water, forest & monsoon', photoId: 'jog-falls' },
  { name: 'Heritage & Architecture', summary: 'Ancient towns & stonework', photoId: 'hampi' },
  { name: 'Adventure & Trekking', summary: 'Move, wander, explore', photoId: 'dandeli' },
  { name: 'Wildlife & Nature', summary: 'Forest stays & wild places', photoId: 'kabini' },
  { name: 'Temples & Spiritual', summary: 'Sacred places & quiet time', photoId: 'badami' },
  { name: 'Hidden Gems', summary: 'The quieter side of Karnataka', photoId: 'belur' },
];

const initial: PlannerPreferences = {
  startingCity: 'Bengaluru', destinationId: 'hampi', startDate: format(new Date(), 'yyyy-MM-dd'), endDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'), travellers: 2,
  availableDays: 2, interests: ['Heritage & Architecture'], budget: 6000, style: 'Budget-friendly', pace: 'Balanced', transport: 'Public transport', accommodation: 'Guesthouse', tripFocus: 'Any of Karnataka', travellingWithChildren: false,
};

function makePreferences(destinationId?: string, partial?: Partial<PlannerPreferences>): PlannerPreferences {
  return { ...initial, ...(partial ?? {}), ...(destinationId ? { destinationId } : {}) };
}

export function TripWizard({ open, initialDestinationId, initialPreferences, onClose, onSave, onFavorite, onPreferencesChange }: {
  open: boolean; initialDestinationId?: string; initialPreferences?: Partial<PlannerPreferences>; onClose: () => void; onSave: (trip: SavedTrip) => Promise<boolean>; onFavorite: (ids: string[]) => void; onPreferencesChange: (preferences: PlannerPreferences) => void;
}) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<PlannerPreferences>(() => makePreferences(initialDestinationId, initialPreferences));
  const [days, setDays] = useState(() => buildItinerary(makePreferences(initialDestinationId, initialPreferences)));
  const [seed, setSeed] = useState(0);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [destinationNotice, setDestinationNotice] = useState('');
  const total = useMemo(() => itineraryTotal(days), [days]);

  useEffect(() => {
    if (!open) return;
    const next = makePreferences(initialDestinationId, initialPreferences);
    setStep(0);
    setPreferences(next);
    onPreferencesChange(next);
    setDays(buildItinerary(next));
    setSeed(0);
    setSaved(false);
    setSaveError('');
    setDestinationNotice('');
  }, [open, initialDestinationId, initialPreferences, onPreferencesChange]);

  if (!open) return null;

  const commit = (next: PlannerPreferences) => { setPreferences(next); onPreferencesChange(next); };
  const patch = <K extends keyof PlannerPreferences>(key: K, value: PlannerPreferences[K]) => commit({ ...preferences, [key]: value });
  const reset = () => {
    const next = makePreferences(initialDestinationId, initialPreferences);
    setStep(0); commit(next); setDays(buildItinerary(next)); setSeed(0); setSaved(false); setSaveError(''); setDestinationNotice('');
  };
  const toggleInterest = (value: Category) => {
    const next = preferences.interests.includes(value) ? preferences.interests.filter((interest) => interest !== value) : [...preferences.interests, value];
    patch('interests', next);
  };
  const generate = async (addHidden = false, pace?: PlannerPreferences['pace'], style?: PlannerPreferences['style']) => {
    const next = {
      ...preferences,
      ...(pace ? { pace } : {}),
      ...(style ? { style } : {}),
      interests: addHidden && !preferences.interests.includes('Hidden Gems') ? [...preferences.interests, 'Hidden Gems' as Category] : preferences.interests,
    };
    commit(next); setGenerating(true);
    try { setDays((await requestItinerary(next, seed)).days); }
    catch { setDays(buildItinerary(next, seed)); }
    finally { setGenerating(false); }
    setSeed((value) => value + 1); setSaved(false); setStep(3);
  };
  const updateBudget = async () => {
    const next = { ...preferences, budget: Math.max(500, preferences.budget + 2000) };
    commit(next); setGenerating(true);
    try { setDays((await requestItinerary(next, seed)).days); }
    catch { setDays(buildItinerary(next, seed)); }
    finally { setGenerating(false); }
    setSeed((value) => value + 1); setSaved(false);
  };
  const save = async () => {
    const trip = saveTripRecord(preferences, days);
    const ok = await onSave(trip);
    setSaved(ok); setSaveError(ok ? '' : 'Could not save this trip to the current browser.');
  };
  const chooseTripDestination = (value: string) => {
    if (value === 'surprise') {
      const matches = destinations.filter((destination) => {
        const interestMatch = !preferences.interests.length || preferences.interests.includes(destination.category) || preferences.interests.includes('Hidden Gems') && destination.tags.includes('hidden gems');
        return interestMatch && destination.days <= preferences.availableDays && destination.budgetMin <= preferences.budget;
      });
      if (matches.length) {
        patch('destinationId', matches[seed % matches.length].id);
        setDestinationNotice('');
      } else {
        patch('destinationId', 'surprise');
        setDestinationNotice('No single destination in this local sample matches every selected interest, day limit, and budget. We’ll build a broader itinerary within your days and budget; change your choices if you want a tighter match.');
      }
    } else {
      patch('destinationId', value);
      setDestinationNotice('');
    }
  };
  const progressLabels = ['Your trip', 'What you love', 'Travel style', 'Your itinerary'];

  return <ModalFrame title="Plan a journey that feels like yours." eyebrow="YOUR NEXT CHAPTER" onClose={onClose} className="planner-modal">
    <div className="planner-intro"><Compass size={18} /><span>A locally generated idea — use district hotel and restaurant links for live listings and confirm bookings directly.</span></div>
    <div className="planner-progress" role="group" aria-label={`Step ${step + 1} of 4`}>
      {progressLabels.map((label, index) => <button type="button" key={label} className={step === index ? 'progress-current' : index < step ? 'progress-done' : ''} aria-current={step === index ? 'step' : undefined} onClick={() => { if (index <= step) setStep(index); }}><i>{index < step ? <Check size={12} /> : index + 1}</i>{label}</button>)}
    </div>
    <AnimatePresence mode="wait">
      {step === 0 && <motion.div className="planner-step" key="step-one" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
        <span className="eyebrow">01 / THE OUTLINE</span><h3>Where are you starting?</h3><p>Set the shape of your trip. We’ll keep the itinerary close to your time and budget.</p>
        <div className="form-grid two">
          <label className="field">Starting city<input value={preferences.startingCity} onChange={(event) => patch('startingCity', event.target.value)} placeholder="Bengaluru" /></label>
          <label className="field">Destination<select value={preferences.destinationId} onChange={(event) => chooseTripDestination(event.target.value)}><option value="surprise">Surprise me</option>{destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.name} · {destination.region}</option>)}</select></label>
          <label className="field">Trip package<select value={preferences.tripFocus} onChange={(event) => patch('tripFocus', event.target.value as TripFocus)}><option>Any of Karnataka</option><option>South Karnataka</option><option>North Karnataka</option><option>Coastal Karnataka</option><option>Heritage &amp; adventure</option><option>Family with kids</option><option>Women-only group</option></select></label>
          <label className="field field-check"><input type="checkbox" checked={preferences.travellingWithChildren} onChange={(event) => patch('travellingWithChildren', event.target.checked)} /> Travelling with children — favour wildlife, gardens, and gentler days</label>
          {destinationNotice && <p className="planner-constraint-notice" role="status">{destinationNotice}</p>}
          <label className="field">Start date<input type="date" value={preferences.startDate} onChange={(event) => {
            const date = event.target.value;
            const range = Math.max(1, Math.min(10, differenceInCalendarDays(new Date(`${preferences.endDate}T12:00:00`), new Date(`${date}T12:00:00`)) + 1));
            commit({ ...preferences, startDate: date, availableDays: range, endDate: format(addDays(new Date(`${date}T12:00:00`), range - 1), 'yyyy-MM-dd') });
          }} /></label>
          <label className="field">End date<input type="date" min={preferences.startDate} value={preferences.endDate} onChange={(event) => {
            const end = event.target.value;
            const range = Math.max(1, Math.min(10, differenceInCalendarDays(new Date(`${end}T12:00:00`), new Date(`${preferences.startDate}T12:00:00`)) + 1));
            commit({ ...preferences, endDate: end, availableDays: range });
          }} /></label>
          <label className="field">Available days<input type="number" min={1} max={10} value={preferences.availableDays} onChange={(event) => {
            const value = Math.max(1, Math.min(10, Number(event.target.value) || 1));
            commit({ ...preferences, availableDays: value, endDate: format(addDays(new Date(`${preferences.startDate}T12:00:00`), value - 1), 'yyyy-MM-dd') });
          }} /></label>
          <div className="field"><span>Travellers</span><div className="stepper"><button type="button" onClick={() => patch('travellers', Math.max(1, preferences.travellers - 1))} aria-label="Remove a traveller"><Minus size={15} /></button><strong>{preferences.travellers}</strong><button type="button" onClick={() => patch('travellers', Math.min(15, preferences.travellers + 1))} aria-label="Add a traveller"><Plus size={15} /></button></div></div>
        </div>
        <div className="planner-actions"><span className="approx-note">Plan first. Fine-tune later.</span><PrimaryButton onClick={() => setStep(1)}>Choose your interests <ArrowRight size={16} /></PrimaryButton></div>
      </motion.div>}

      {step === 1 && <motion.div className="planner-step" key="step-two" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
        <span className="eyebrow">02 / YOUR INTERESTS</span><h3>What would you like to feel?</h3><p>Choose more than one. Your itinerary will find a route through the experiences you love.</p>
        <div className="interest-grid">{interestGroups.map((item) => <button type="button" key={item.name} className={`interest-card ${preferences.interests.includes(item.name) ? 'interest-selected' : ''}`} onClick={() => toggleInterest(item.name)} style={{ backgroundImage: `linear-gradient(180deg, transparent, rgba(15,34,27,.83)), url('${destinations.find((destination) => destination.id === item.photoId)?.image}')` }} aria-pressed={preferences.interests.includes(item.name)}><i>{preferences.interests.includes(item.name) && <Check size={13} />}</i><strong>{item.name}</strong><small>{item.summary}</small></button>)}</div>
        <div className="planner-actions"><button type="button" className="back-link" onClick={() => setStep(0)}><ArrowLeft size={15} /> Back to trip details</button><PrimaryButton onClick={() => setStep(2)}>Choose travel style <ArrowRight size={16} /></PrimaryButton></div>
      </motion.div>}

      {step === 2 && <motion.div className="planner-step" key="step-three" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
        <span className="eyebrow">03 / BUDGET & RHYTHM</span><h3>How would you like to travel?</h3><p>Shape the spend, pace, transport, and stay around the time you have.</p>
        <div className="form-grid two planner-setting-grid">
          <label className="field">Total budget in ₹<input type="number" min="500" step="500" value={preferences.budget} onChange={(event) => patch('budget', Number(event.target.value) || 500)} /></label>
          <label className="field">Travel style<select value={preferences.style} onChange={(event) => patch('style', event.target.value as PlannerPreferences['style'])}><option>Budget-friendly</option><option>Moderate</option><option>Premium</option></select></label>
          <label className="field">Pace<select value={preferences.pace} onChange={(event) => patch('pace', event.target.value as PlannerPreferences['pace'])}><option>Relaxed</option><option>Balanced</option><option>Adventure-packed</option></select></label>
          <label className="field">Getting around<select value={preferences.transport} onChange={(event) => patch('transport', event.target.value)}><option>Public transport</option><option>Self-drive</option><option>Rental car</option><option>Local cab</option></select></label>
          <label className="field">A place to stay<select value={preferences.accommodation} onChange={(event) => patch('accommodation', event.target.value)}><option>Guesthouse</option><option>Homestay</option><option>Hotel</option><option>Camping</option><option>Premium stay</option></select></label>
        </div>
        <div className="planner-actions"><button type="button" className="back-link" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back to interests</button><PrimaryButton disabled={generating} onClick={() => void generate()}>{generating ? 'Planning your route…' : <>Shape my itinerary <Sparkles size={15} /></>}</PrimaryButton></div>
      </motion.div>}

      {step === 3 && <motion.div className="planner-step itinerary-step" key="step-four" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
        <span className="eyebrow">04 / YOUR LOCAL ITINERARY</span><h3>A journey, shaped around you.</h3><p>{preferences.availableDays} days · {preferences.travellers} traveller{preferences.travellers === 1 ? '' : 's'} · {preferences.interests.length ? preferences.interests.slice(0, 2).join(' & ') : 'A little of everything'}</p>
        <div className="estimate-banner"><span><Wallet size={18} /> Estimated total, approximate</span><strong>₹{total.toLocaleString('en-IN')}</strong><small>Local planning estimate only — no live pricing or availability is connected.</small></div>
        <div className="itinerary-days">{days.map((day) => {
          const place = destinations.find((destination) => destination.id === day.destinationIds[0]);
          return <article className="itinerary-day" key={`${seed}-${day.day}`}>
            <DestinationImage src={place?.image} alt={place?.name ?? 'Karnataka landscape'} />
            <div className="itinerary-day-content"><span className="itinerary-day-number">DAY {String(day.day).padStart(2, '0')} <b>·</b> {place?.region}</span><h4>{place?.name}</h4>
              <div className="itinerary-timetable"><p><small>MORNING</small>{day.morning}</p><p><small>AFTERNOON</small>{day.afternoon}</p><p><small>EVENING</small>{day.evening}</p></div>
              <div className="itinerary-costs"><span>Travel <b>₹{day.travelCost.toLocaleString('en-IN')}</b></span><span>Food <b>₹{day.foodCost.toLocaleString('en-IN')}</b></span><span>Stay <b>₹{day.stayCost.toLocaleString('en-IN')}</b></span></div>
              <p className="itinerary-tip">Field note: {day.tip}</p>
            </div>
            {place && <button type="button" className="itinerary-star" onClick={() => onFavorite([place.id])} aria-label={`Save ${place.name} to favorites`}><Heart size={17} /></button>}
          </article>;
        })}</div>
        <div className="planner-disclaimer"><CalendarDays size={16} /> Budget estimates are illustrative and vary with dates, group size, transport, and accommodation. Confirm access and live rates independently.</div>
        <div className="planner-refine-actions"><button type="button" className="back-link" disabled={generating} onClick={() => void generate(false, 'Adventure-packed')}><RefreshCw size={15} /> Make it more adventurous</button><button type="button" className="back-link" disabled={generating} onClick={() => void generate(true)}><MapPin size={15} /> Add hidden gems</button><button type="button" className="back-link" disabled={generating} onClick={() => void updateBudget()}><Wallet size={15} /> Change budget</button></div>
        <div className="planner-actions"><button type="button" className="back-link" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back to travel style</button><div className="planner-result-actions"><button type="button" className="button button-outline" disabled={generating} onClick={() => void generate()}><RefreshCw size={15} /> Regenerate</button><PrimaryButton onClick={save}>{saved ? <Check size={15} /> : <Bookmark size={15} />}{saved ? 'Saved to your trips' : 'Save this trip'}</PrimaryButton></div></div>
        {saveError && <p className="form-error" role="alert">{saveError}</p>}
        {preferences.tripFocus === 'Women-only group' && <div className="planner-safety-note"><strong>Group check-in plan:</strong> share this itinerary with a trusted contact, keep phones charged, agree on a meeting point, and use registered transport. In an emergency in India call <a href="tel:112">112</a>; Women Helpline: <a href="tel:181">181</a>.</div>}
        {preferences.travellingWithChildren && <div className="planner-safety-note"><strong>Family pace:</strong> allow extra time for meals and rest, carry water and essentials, and check age and access rules with each venue before setting out.</div>}
        <div className="planner-bottom-links"><Route size={14} /> {preferences.tripFocus} · From {preferences.startingCity || 'your starting city'} by {preferences.transport.toLowerCase()} · {preferences.accommodation.toLowerCase()} accommodation</div>
      </motion.div>}
    </AnimatePresence>
    <button type="button" className="planner-reset" onClick={reset}><X size={14} /> Start over</button>
  </ModalFrame>;
}
