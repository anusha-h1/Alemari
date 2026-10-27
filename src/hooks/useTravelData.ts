import { useCallback, useEffect, useState } from 'react';
import type { LocalPreferences } from '../services/storage';
import { clearAllLocalTravelData, defaultPreferences, deletePhoto, listMemories, listTrips, putMemory, putPhoto, putTrip, readPreferences, removeMemory as removeStoredMemory, removeTrip as removeStoredTrip, writePreferences } from '../services/storage';
import type { Category, PlannerPreferences, SavedTrip, TravelMemory } from '../types';

export function useTravelData() {
  const [memories, setMemories] = useState<TravelMemory[]>([]);
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [preferences, setPreferences] = useState<LocalPreferences>(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([listMemories(), listTrips()]).then(([savedMemories, savedTrips]) => {
      if (!mounted) return;
      setMemories(savedMemories.sort((a, b) => b.visitDate.localeCompare(a.visitDate)));
      setTrips(savedTrips.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      setPreferences(readPreferences());
      setReady(true);
    }).catch((error: unknown) => {
      console.error(error);
      if (mounted) { setStorageError('Your browser could not open local storage. Try reloading or using a modern browser.'); setReady(true); }
    });
    return () => { mounted = false; };
  }, []);

  const setPreferenceField = useCallback(<K extends keyof LocalPreferences>(key: K, update: LocalPreferences[K] | ((current: LocalPreferences[K]) => LocalPreferences[K])) => {
    setPreferences((previous) => {
      const current = previous[key];
      const value = typeof update === 'function' ? (update as (current: LocalPreferences[K]) => LocalPreferences[K])(current) : update;
      const next = { ...previous, [key]: value };
      writePreferences(next);
      return next;
    });
  }, []);

  const setFavorites = useCallback((update: string[] | ((current: string[]) => string[])) => setPreferenceField('favorites', update), [setPreferenceField]);
  const setVisited = useCallback((update: string[] | ((current: string[]) => string[])) => setPreferenceField('visited', update), [setPreferenceField]);
  const setInterests = useCallback((update: Category[] | ((current: Category[]) => Category[])) => setPreferenceField('interests', update), [setPreferenceField]);
  const setAvailableDays = useCallback((days: number) => setPreferenceField('availableDays', Math.max(1, Math.min(10, Math.round(days) || 1))), [setPreferenceField]);
  const setPlannerPreferences = useCallback((planner: PlannerPreferences) => setPreferenceField('planner', planner), [setPreferenceField]);
  const toggleFavorite = useCallback((id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]), [setFavorites]);
  const toggleVisited = useCallback((id: string) => setVisited((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]), [setVisited]);

  const saveMemory = useCallback(async (memory: TravelMemory, newFiles: { id: string; file: File }[], removedPhotoIds: string[] = []) => {
    try {
      for (const { id, file } of newFiles) await putPhoto(id, file);
      for (const id of removedPhotoIds) await deletePhoto(id);
      await putMemory(memory);
      setMemories((current) => [memory, ...current.filter((item) => item.id !== memory.id)].sort((a, b) => b.visitDate.localeCompare(a.visitDate)));
      setStorageError('');
      return true;
    } catch (error) {
      console.error(error); setStorageError('The memory could not be saved locally. Your browser may be low on storage space.'); return false;
    }
  }, []);

  const deleteMemory = useCallback(async (id: string) => {
    try { await removeStoredMemory(id); setMemories((current) => current.filter((memory) => memory.id !== id)); setStorageError(''); return true; }
    catch (error) { console.error(error); setStorageError('This memory could not be removed from browser storage.'); return false; }
  }, []);

  const saveTrip = useCallback(async (trip: SavedTrip) => {
    try { await putTrip(trip); setTrips((current) => [trip, ...current.filter((item) => item.id !== trip.id)]); return true; }
    catch (error) { console.error(error); setStorageError('The trip could not be saved locally.'); return false; }
  }, []);

  const deleteTrip = useCallback(async (id: string) => {
    try { await removeStoredTrip(id); setTrips((current) => current.filter((trip) => trip.id !== id)); return true; }
    catch (error) { console.error(error); setStorageError('The saved trip could not be removed.'); return false; }
  }, []);

  const setNewTripFavorites = useCallback((ids: string[]) => setFavorites((current) => Array.from(new Set([...current, ...ids]))), [setFavorites]);
  const clearAll = useCallback(async () => {
    try { await clearAllLocalTravelData(); setMemories([]); setTrips([]); setPreferences(defaultPreferences); setStorageError(''); return true; }
    catch (error) { console.error(error); setStorageError('The browser could not clear all local travel data.'); return false; }
  }, []);

  return { memories, trips, preferences, ready, storageError, setStorageError, setFavorites, setVisited, setInterests, setAvailableDays, setPlannerPreferences, toggleFavorite, toggleVisited, saveMemory, deleteMemory, saveTrip, deleteTrip, setNewTripFavorites, clearAll };
}
