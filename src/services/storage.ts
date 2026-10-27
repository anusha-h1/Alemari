import { openDB, type IDBPDatabase } from 'idb';
import { addDays, format } from 'date-fns';
import type { Category, PlannerPreferences, SavedTrip, TravelMemory } from '../types';

interface AlemariDb {
  memories: { key: string; value: TravelMemory; indexes: { 'by-visitDate': string } };
  photos: { key: string; value: Blob };
  trips: { key: string; value: SavedTrip; indexes: { 'by-createdAt': string } };
}

let databasePromise: Promise<IDBPDatabase<AlemariDb>> | undefined;
const database = () => {
  databasePromise ??= openDB<AlemariDb>('alemari-local-travel-v1', 1, {
    upgrade(db) {
      const memories = db.createObjectStore('memories', { keyPath: 'id' });
      memories.createIndex('by-visitDate', 'visitDate');
      db.createObjectStore('photos');
      const trips = db.createObjectStore('trips', { keyPath: 'id' });
      trips.createIndex('by-createdAt', 'createdAt');
    },
  });
  return databasePromise;
};

const PREFS_KEY = 'alemari-preferences-v1';
export interface LocalPreferences {
  favorites: string[];
  visited: string[];
  interests: Category[];
  theme: 'light';
  availableDays: number;
  planner: PlannerPreferences;
}

const today = new Date();
export const defaultPreferences: LocalPreferences = {
  favorites: [], visited: [], interests: [], theme: 'light', availableDays: 2,
  planner: {
    startingCity: 'Bengaluru', destinationId: 'hampi', startDate: format(today, 'yyyy-MM-dd'), endDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    travellers: 2, availableDays: 2, interests: ['Heritage & Architecture'], budget: 6000, style: 'Budget-friendly', pace: 'Balanced',
    transport: 'Public transport', accommodation: 'Guesthouse',
  },
};

export function readPreferences(): LocalPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<LocalPreferences>;
    const savedPlanner = (parsed.planner ?? {}) as Partial<PlannerPreferences>;
    const planner: PlannerPreferences = {
      ...defaultPreferences.planner,
      ...savedPlanner,
      availableDays: savedPlanner.availableDays ?? parsed.availableDays ?? defaultPreferences.planner.availableDays,
      interests: savedPlanner.interests ?? (parsed.interests?.length ? parsed.interests : defaultPreferences.planner.interests),
    };
    return {
      ...defaultPreferences,
      ...parsed,
      interests: parsed.interests ?? planner.interests,
      availableDays: parsed.availableDays ?? planner.availableDays,
      planner,
    };
  } catch {
    return defaultPreferences;
  }
}

export function writePreferences(preferences: LocalPreferences) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(preferences)); } catch (error) { console.warn('Unable to save preferences locally', error); }
}

export const listMemories = async () => (await database()).getAll('memories');
export const putMemory = async (memory: TravelMemory) => (await database()).put('memories', memory);
export const removeMemory = async (id: string) => {
  const db = await database();
  const tx = db.transaction(['memories', 'photos'], 'readwrite');
  const existing = await tx.objectStore('memories').get(id);
  if (existing) for (const photo of existing.photos) tx.objectStore('photos').delete(photo.id);
  tx.objectStore('memories').delete(id);
  await tx.done;
};
export const getPhoto = async (id: string) => (await database()).get('photos', id);
export const putPhoto = async (id: string, blob: Blob) => (await database()).put('photos', blob, id);
export const deletePhoto = async (id: string) => (await database()).delete('photos', id);
export const listTrips = async () => (await database()).getAll('trips');
export const putTrip = async (trip: SavedTrip) => (await database()).put('trips', trip);
export const removeTrip = async (id: string) => (await database()).delete('trips', id);
export async function clearAllLocalTravelData() {
  const db = await database();
  const tx = db.transaction(['memories', 'photos', 'trips'], 'readwrite');
  await Promise.all([tx.objectStore('memories').clear(), tx.objectStore('photos').clear(), tx.objectStore('trips').clear()]);
  await tx.done;
  localStorage.removeItem(PREFS_KEY);
}
