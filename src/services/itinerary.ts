import { destinations } from '../data/destinations';
import type { ItineraryDay, PlannerPreferences, SavedTrip } from '../types';

export function buildItinerary(preferences: PlannerPreferences, seed = 0): ItineraryDay[] {
  const count = Math.max(1, Math.min(10, Math.round(preferences.availableDays || 1)));
  const available = [...destinations];
  const preferred = available.find((destination) => destination.id === preferences.destinationId);
  const ranked = available.map((destination) => {
    const shared = destination.tags.some((tag) => preferences.interests.some((interest) => `${interest} ${destination.category}`.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(interest.toLowerCase().split(' ')[0])));
    const interestMatch = preferences.interests.includes(destination.category);
    const budgetMatch = destination.budgetMin <= preferences.budget;
    return { destination, score: Number(destination.id === preferred?.id) * 10 + Number(interestMatch) * 3 + Number(shared) * 2 + Number(budgetMatch) };
  }).sort((a, b) => b.score - a.score || a.destination.name.localeCompare(b.destination.name));

  const pool = ranked.filter((entry) => !preferences.destinationId || entry.destination.id !== preferred?.id);
  const ordered = preferred ? [preferred, ...pool.map((entry) => entry.destination)] : pool.map((entry) => entry.destination);
  const used = new Set<string>();
  const pick = (day: number) => {
    const candidates = ordered.filter((destination) => !used.has(destination.id));
    if (candidates.length === 0) {
      const next = ordered[(day + seed) % ordered.length];
      return next;
    }
    const destination = candidates[(day + seed) % Math.min(candidates.length, Math.max(1, Math.min(3, candidates.length)))];
    used.add(destination.id);
    return destination;
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
