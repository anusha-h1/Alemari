import { destinations } from '../data/destinations';
import type { ItineraryDay, PlannerPreferences, SavedTrip } from '../types';

const MAX_ROUTE_RADIUS_KM = 150;

const startCityCoordinates: Record<string, [number, number]> = {
  bengaluru: [12.9716, 77.5946], bangalore: [12.9716, 77.5946], mysuru: [12.2958, 76.6394], mysore: [12.2958, 76.6394],
  gadag: [15.429, 75.63], hubballi: [15.3647, 75.124], hubli: [15.3647, 75.124], dharwad: [15.4589, 75.0078],
  mangaluru: [12.9141, 74.856], mangalore: [12.9141, 74.856], udupi: [13.3409, 74.7421], ballari: [15.1394, 76.9214],
  hampi: [15.335, 76.46], chikmagaluru: [13.3161, 75.772], chikkamagaluru: [13.3161, 75.772],
};

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

export function buildItinerary(preferences: PlannerPreferences, seed = 0): ItineraryDay[] {
  const count = Math.max(1, Math.min(10, Math.round(preferences.availableDays || 1)));
  const available = [...destinations];
  const focus = preferences.tripFocus ?? 'Any of Karnataka';
  const southDistricts = new Set(['Mysuru', 'Mandya', 'Kodagu', 'Chamarajanagar', 'Tumakuru', 'Hassan', 'Kolar', 'Chikkaballapur', 'Bengaluru Rural', 'Bengaluru Urban', 'Bengaluru South', 'Bengaluru South (Ramanagara)']);
  const northDistricts = new Set(['Bagalkote', 'Ballari', 'Belagavi', 'Bidar', 'Chitradurga', 'Davanagere', 'Dharwad', 'Gadag', 'Haveri', 'Kalaburagi', 'Koppal', 'Raichur', 'Vijayapura', 'Yadgir', 'Shivamogga']);
  const inFocus = (destination: (typeof available)[number]) => {
    if (focus === 'South Karnataka') return destination.region === 'South Karnataka' || southDistricts.has(destination.district) || destination.district.startsWith('Bengaluru South');
    if (focus === 'North Karnataka') return destination.region === 'North Karnataka' || destination.region === 'Central Karnataka' || northDistricts.has(destination.district);
    if (focus === 'Coastal Karnataka') return ['Dakshina Kannada', 'Udupi', 'Uttara Kannada'].includes(destination.district) || destination.region === 'Karavali Coast';
    if (focus === 'Heritage & adventure') return ['Heritage & Architecture', 'Adventure & Trekking', 'Mountains & Hills'].includes(destination.category);
    if (focus === 'Family with kids' || preferences.travellingWithChildren) return destination.tags.some((tag) => ['kids', 'family'].includes(tag)) || ['Mysuru', 'Gadag'].includes(destination.district) && destination.category === 'Wildlife & Nature';
    return true;
  };
  const scoped = available.filter((destination) => inFocus(destination) || destination.id === preferences.destinationId);
  const scopePool = scoped.length ? scoped : available;
  const preferred = scopePool.find((destination) => destination.id === preferences.destinationId);
  const ranked = scopePool.map((destination) => {
    const shared = destination.tags.some((tag) => preferences.interests.some((interest) => `${interest} ${destination.category}`.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(interest.toLowerCase().split(' ')[0])));
    const interestMatch = preferences.interests.includes(destination.category);
    const budgetMatch = destination.budgetMin <= preferences.budget;
    const familyBonus = (focus === 'Family with kids' || preferences.travellingWithChildren) && destination.tags.some((tag) => ['kids', 'family'].includes(tag)) ? 8 : 0;
    return { destination, score: Number(destination.id === preferred?.id) * 10 + familyBonus + Number(interestMatch) * 3 + Number(shared) * 2 + Number(budgetMatch) };
  }).sort((a, b) => b.score - a.score || a.destination.name.localeCompare(b.destination.name));

  // Keep each itinerary around one anchor. The selected destination wins; otherwise
  // prefer a strong match close to the traveller's stated starting city.
  const normalizedCity = preferences.startingCity.trim().toLowerCase();
  const cityCoordinates = startCityCoordinates[normalizedCity];
  const startingPoint = cityCoordinates ? { lat: cityCoordinates[0], lng: cityCoordinates[1] } : undefined;
  const localCandidates = startingPoint ? ranked.filter(({ destination }) => distanceKm(startingPoint, destination) <= 150) : [];
  const anchorCandidates = localCandidates.length ? localCandidates : ranked;
  const anchor = preferred ?? [...anchorCandidates].sort((a, b) => {
    const aDistance = startingPoint ? distanceKm(startingPoint, a.destination) : 0;
    const bDistance = startingPoint ? distanceKm(startingPoint, b.destination) : 0;
    return (b.score - bDistance / 30) - (a.score - aDistance / 30);
  })[0]?.destination ?? scopePool[0];
  const nearby = ranked
    .filter(({ destination }) => destination.id === anchor.id || distanceKm(anchor, destination) <= MAX_ROUTE_RADIUS_KM)
    .sort((a, b) => {
      if (a.destination.id === anchor.id) return -1;
      if (b.destination.id === anchor.id) return 1;
      return distanceKm(anchor, a.destination) - distanceKm(anchor, b.destination) || b.score - a.score;
    })
    .map(({ destination }) => destination);
  const nearbyIds = new Set(nearby.map((destination) => destination.id));
  const localAlternatives = available.filter((destination) => !nearbyIds.has(destination.id) && distanceKm(anchor, destination) <= MAX_ROUTE_RADIUS_KM)
    .sort((a, b) => distanceKm(anchor, a) - distanceKm(anchor, b));
  const ordered = [...(nearby.length ? nearby : [anchor]), ...localAlternatives];
  const used = new Set<string>();
  const pick = (day: number) => {
    if (day === 0 || ordered.length === 1) {
      used.add(ordered[0].id);
      return ordered[0];
    }
    const candidates = ordered.filter((destination) => !used.has(destination.id));
    if (!candidates.length) return ordered[(day + seed) % ordered.length];
    const choice = candidates[0];
    used.add(choice.id);
    return choice;
  };

  return Array.from({ length: count }, (_, index) => {
    const destination = pick(index);
    const dayScale = preferences.pace === 'Relaxed' ? 0.82 : preferences.pace === 'Adventure-packed' ? 1.2 : 1;
    const budgetFactor = preferences.style === 'Premium' ? 1.8 : preferences.style === 'Moderate' ? 1.2 : 0.72;
    const travellerCount = Math.max(1, preferences.travellers);
    const selectedDailyCap = Math.max(0, preferences.budget) / Math.max(1, count);
    const perTravellerGuide = (destination.budgetMin + destination.budgetMax) / 2 / Math.max(1, destination.days);
    const destinationEstimate = perTravellerGuide * budgetFactor * dayScale * travellerCount;
    const transportFactor: Record<string, number> = { 'Public transport': 0.82, 'Self-drive': 1.08, 'Rental car': 1.3, 'Local cab': 1.38 };
    const accommodationFactor: Record<string, number> = { Guesthouse: 0.82, Homestay: 0.96, Hotel: 1.22, Camping: 0.68, 'Premium stay': 1.62 };
    const travelWeight = 0.3 * (transportFactor[preferences.transport] ?? 1);
    const foodWeight = 0.25;
    const stayWeight = 0.45 * (accommodationFactor[preferences.accommodation] ?? 1);
    const weightTotal = travelWeight + foodWeight + stayWeight;
    const dayBudget = Math.floor(Math.min(selectedDailyCap, destinationEstimate * weightTotal));
    const experiences = destination.highlights;
    const morning = index === 0 && preferred
      ? `Set out from ${preferences.startingCity || 'your starting city'} and arrive at ${destination.name}. Visit ${experiences[0]}.`
      : `Begin early at ${experiences[0]} and explore ${destination.name}.`;
    const afternoon = `Enjoy ${experiences[1] ?? destination.highlights[0]} at an unhurried pace; allow time for lunch and local details.`;
    const evening = experiences[2]
      ? `Wind down with ${experiences[2]} and a relaxed local dinner.`
      : `Leave time for a neighbourhood walk and a relaxed local dinner.`;
    const travelCost = Math.floor(dayBudget * travelWeight / weightTotal);
    const foodCost = Math.floor(dayBudget * foodWeight / weightTotal);
    return {
      day: index + 1,
      destinationIds: [destination.id],
      morning,
      afternoon,
      evening,
      travelCost,
      foodCost,
      stayCost: dayBudget - travelCost - foodCost,
      tip: destination.category === 'Adventure & Trekking' ? 'Check local permissions, route conditions, and weather before you set out.' : 'Confirm local opening times and transport before travelling; conditions can change by season.',
    };
  });
}

export function isLocalUniqueItinerary(preferences: PlannerPreferences, days: ItineraryDay[]) {
  if (!days.length) return false;
  const places = days.map((day) => destinations.find((destination) => destination.id === day.destinationIds[0]));
  if (places.some((place) => !place)) return false;
  const resolved = places.filter((place): place is (typeof destinations)[number] => Boolean(place));
  const ids = resolved.map((place) => place.id);
  if (new Set(ids).size !== ids.length) return false;
  const preferred = destinations.find((destination) => destination.id === preferences.destinationId);
  if (preferred && ids[0] !== preferred.id) return false;
  const anchor = preferred ?? resolved[0];
  return resolved.every((place) => distanceKm(anchor, place) <= MAX_ROUTE_RADIUS_KM);
}

export const itineraryTotal = (days: ItineraryDay[]) => days.reduce((sum, day) => sum + day.travelCost + day.foodCost + day.stayCost, 0);

export function saveTripRecord(preferences: PlannerPreferences, days: ItineraryDay[]): SavedTrip {
  const total = itineraryTotal(days);
  const place = destinations.find((destination) => destination.id === preferences.destinationId);
  return {
    id: crypto.randomUUID(),
    title: place ? `A journey to ${place.name}` : `A ${days.length}-day Karnataka journey`,
    createdAt: new Date().toISOString(),
    preferences: structuredClone(preferences),
    days: structuredClone(days),
    estimatedTotal: total,
  };
}
