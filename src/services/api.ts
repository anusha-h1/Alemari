import type { PlannerPreferences, SavedTrip, TravelMemory } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new Error(`ALEMARI API returned ${response.status}`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function requestAssistantAnswer(question: string, context: { interests: string[]; visitedIds: string[]; memories: TravelMemory[]; availableDays: number }) {
  const result = await request<{ answer: string }>('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({ question, interests: context.interests, visitedIds: context.visitedIds, availableDays: context.availableDays }),
  });
  return result.answer;
}

export function requestItinerary(preferences: PlannerPreferences, seed = 0) {
  return request<{ days: SavedTrip['days']; estimatedTotal: number; approximate: boolean }>('/itinerary', {
    method: 'POST', body: JSON.stringify({ ...preferences, seed }),
  });
}
