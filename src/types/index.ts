export const categories = [
  'Mountains & Hills',
  'Beaches & Coast',
  'Waterfalls & Rivers',
  'Heritage & Architecture',
  'Temples & Spiritual',
  'Wildlife & Nature',
  'Adventure & Trekking',
  'Weekend Getaways',
  'Hidden Gems',
] as const;

export type Category = (typeof categories)[number];

export interface Destination {
  id: string;
  name: string;
  kannada?: string;
  district: string;
  region: string;
  lat: number;
  lng: number;
  category: Category;
  tags: string[];
  image: string;
  description: string;
  duration: string;
  days: number;
  budgetMin: number;
  budgetMax: number;
  highlights: string[];
  storyTitle?: string;
  story?: string;
}

export interface PhotoRef {
  id: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface TravelMemory {
  id: string;
  destinationId: string;
  title: string;
  visitDate: string;
  caption: string;
  story: string;
  favouriteMoment: string;
  photos: PhotoRef[];
  rating?: number;
  companions: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type BudgetStyle = 'Budget-friendly' | 'Moderate' | 'Premium';
export type TripPace = 'Relaxed' | 'Balanced' | 'Adventure-packed';
export type TripFocus = 'Any of Karnataka' | 'South Karnataka' | 'North Karnataka' | 'Coastal Karnataka' | 'Heritage & adventure' | 'Family with kids' | 'Women-only group';

export interface PlannerPreferences {
  startingCity: string;
  destinationId: string;
  startDate: string;
  endDate: string;
  travellers: number;
  availableDays: number;
  interests: Category[];
  budget: number;
  style: BudgetStyle;
  pace: TripPace;
  transport: string;
  accommodation: string;
  tripFocus: TripFocus;
  travellingWithChildren: boolean;
}

export interface ItineraryDay {
  day: number;
  destinationIds: string[];
  morning: string;
  afternoon: string;
  evening: string;
  travelCost: number;
  foodCost: number;
  stayCost: number;
  tip: string;
}

export interface SavedTrip {
  id: string;
  title: string;
  createdAt: string;
  preferences: PlannerPreferences;
  days: ItineraryDay[];
  estimatedTotal: number;
}

export type MemoryDraft = Omit<TravelMemory, 'id' | 'photos' | 'createdAt' | 'updatedAt'>;
