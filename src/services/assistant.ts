import { destinations } from '../data/destinations';
import type { TravelMemory } from '../types';

export interface AssistantContext {
  interests: string[];
  visitedIds: string[];
  memories: TravelMemory[];
  availableDays?: number;
}

const joinPlaces = (ids: string[]) => ids.map((id) => destinations.find((destination) => destination.id === id)?.name).filter(Boolean).join(', ');

export function answerTravelQuestion(question: string, context: AssistantContext): string {
  const q = question.toLowerCase();
  const requestedDays = /two.?day|2 day|two days|weekend|weekend trip/.test(q) ? 2 : /three.?day|3 day/.test(q) ? 3 : 0;
  const budgetMatch = q.match(/(?:under|within|budget|₹|rs\.?\s*)(?:\s*₹\s*)?([\d,]+)/i);
  const budget = budgetMatch ? Number(budgetMatch[1].replaceAll(',', '')) : null;
  const named = destinations.find((destination) => q.includes(destination.name.toLowerCase()) || (destination.kannada && q.includes(destination.kannada)));
  const keyword = q.includes('waterfall') ? 'waterfall' : q.includes('beach') || q.includes('coast') ? 'coast' : q.includes('heritage') || q.includes('history') || q.includes('temple') ? 'heritage' : q.includes('coffee') ? 'coffee' : q.includes('wildlife') || q.includes('safari') || q.includes('forest') ? 'wildlife' : q.includes('mountain') || q.includes('hill') || q.includes('peaceful') || q.includes('calm') ? 'mountain' : q.includes('hidden') || q.includes('gem') ? 'hidden' : q.includes('adventure') || q.includes('raft') || q.includes('trek') ? 'adventure' : '';
  const fresh = destinations.filter((destination) => !context.visitedIds.includes(destination.id));
  const source = q.includes('visited') || q.includes('next') || q.includes('memory') ? fresh : destinations;
  const memoryBased = /memor|journal|story|saved/.test(q) && context.memories.length > 0;
  if (memoryBased && !named && !requestedDays && !q.includes('budget') && !budget && !q.includes('plan')) {
    const rememberedTags = new Set(context.memories.flatMap((memory) => {
      const destination = destinations.find((item) => item.id === memory.destinationId);
      return [...memory.tags, ...(destination?.tags ?? [])].map((tag) => tag.toLowerCase());
    }));
    const suggestions = fresh.map((destination) => ({ destination, matches: destination.tags.filter((tag) => rememberedTags.has(tag.toLowerCase())).length + (rememberedTags.has(destination.category.toLowerCase()) ? 1 : 0) })).sort((a, b) => b.matches - a.matches || a.destination.name.localeCompare(b.destination.name)).filter((item) => item.matches > 0).slice(0, 3).map((item) => item.destination);
    if (suggestions.length) return `Looking at your saved journeys, you seem drawn to ${[...rememberedTags].slice(0, 3).join(', ')}. For a fresh place with a similar feel, consider ${suggestions.map((destination) => `${destination.name} — ${destination.description}`).join('\n\n')}`;
  }
  let recommendations = source.filter((destination) => {
    if (named) return destination.id === named.id || destination.tags.some((tag) => named.tags.includes(tag));
    if (keyword && keyword !== 'hidden') return destination.tags.some((tag) => tag.includes(keyword)) || destination.category.toLowerCase().includes(keyword);
    if (keyword === 'hidden') return destination.tags.includes('hidden gems') || destination.tags.includes('weekend');
    if (context.interests.length) return context.interests.some((interest) => interest.toLowerCase().split(' ')[0] === destination.category.toLowerCase().split(' ')[0] || destination.tags.some((tag) => interest.toLowerCase().includes(tag)));
    return true;
  });
  if (budget) recommendations = recommendations.filter((destination) => destination.budgetMin <= budget);
  if (!recommendations.length) recommendations = source.length ? source : destinations;
  const plannedDays = Math.max(1, Math.min(10, requestedDays || context.availableDays || 2));

  if (q.includes('plan') || requestedDays > 0 || q.includes('itinerary')) {
    const numberOfDays = plannedDays;
    const itineraryPool = [...recommendations, ...source, ...destinations];
    const places = itineraryPool.filter((destination, index, pool) => pool.findIndex((item) => item.id === destination.id) === index).slice(0, numberOfDays);
    const daily = Array.from({ length: numberOfDays }, (_, index) => {
      const destination = places[index % places.length];
      return `Day ${index + 1}: ${destination.name} — take a morning for ${destination.highlights[0]}, then explore ${destination.highlights[1] ?? destination.category.toLowerCase()} and finish with a relaxed local meal.`;
    }).join('\n');
    const estimate = places.reduce((sum, destination) => sum + destination.budgetMin, 0);
    const upperEstimate = places.reduce((sum, destination) => sum + destination.budgetMax, 0);
    return `Here’s a local sample for ${numberOfDays} days:\n${daily}\nApproximate ground-trip range: ₹${estimate.toLocaleString('en-IN')}–₹${upperEstimate.toLocaleString('en-IN')} in total destination estimates, before confirming live transport and stays. Your actual costs depend on group size, route, and season.`;
  }
  if (q.includes('budget') || budget) {
    const names = recommendations.slice(0, 3).map((destination) => `${destination.name} (about ₹${destination.budgetMin.toLocaleString('en-IN')}–₹${destination.budgetMax.toLocaleString('en-IN')})`);
    return `For a rough ${budget ? `₹${budget.toLocaleString('en-IN')} budget` : 'budget-conscious trip'}, consider ${names.join(', ')}. These are approximate local dataset ranges, not live prices; transport distance and overnight stays can change the total.`;
  }
  if (q.includes('visited') || q.includes('next') || q.includes('memory')) {
    return context.visitedIds.length ? `You’ve already explored ${joinPlaces(context.visitedIds)}. For a fresh next chapter, try ${recommendations.slice(0, 3).map((destination) => `${destination.name} (${destination.category.toLowerCase()})`).join(', ')}.` : 'Your travel map is ready for a first chapter. If you tell me whether you prefer hills, beaches, heritage, or wildlife, I can suggest a good starting place.';
  }
  if (q.includes('family')) return `For an easy family outing, consider ${recommendations.slice(0, 2).map((destination) => `${destination.name} (${destination.duration})`).join(' or ')}. Keep travel time and heat in mind, and confirm site access before you go.`;
  if (recommendations.length) return `You might enjoy ${recommendations.slice(0, 3).map((destination) => `${destination.name} — ${destination.description}`).join('\n\n')}`;
  return 'I can help with Karnataka hills, beaches, waterfalls, heritage, wildlife, food, and short itineraries. Tell me your interests, number of days, or an approximate budget and we’ll shape an idea.';
}
