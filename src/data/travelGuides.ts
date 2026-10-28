import type { TripFocus } from '../types';

export const karnatakaDistricts = [
  'Bagalkote', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru South', 'Bengaluru Urban', 'Bidar', 'Chamarajanagar',
  'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga', 'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan',
  'Haveri', 'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Shivamogga',
  'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura', 'Yadgir',
] as const;

export const tripPackages: { focus: TripFocus; title: string; summary: string; icon: 'south' | 'north' | 'coast' | 'mix' | 'kids' | 'safety'; district?: string; interests: string[] }[] = [
  { focus: 'South Karnataka', title: 'South Karnataka', summary: 'Mysuru, Mandya, Kodagu and hill-country escapes.', icon: 'south', district: 'Mysuru', interests: ['Heritage & Architecture', 'Wildlife & Nature', 'Mountains & Hills'] },
  { focus: 'North Karnataka', title: 'North Karnataka heritage', summary: 'Gadag, Hampi, Badami and Deccan-era landmarks.', icon: 'north', district: 'Gadag', interests: ['Heritage & Architecture', 'Temples & Spiritual'] },
  { focus: 'Coastal Karnataka', title: 'Coast & Western Ghats', summary: 'Beaches, temple towns, rivers and forest roads.', icon: 'coast', district: 'Uttara Kannada', interests: ['Beaches & Coast', 'Waterfalls & Rivers', 'Wildlife & Nature'] },
  { focus: 'Heritage & adventure', title: 'History + adventure', summary: 'Mix forts, old temples, hikes and open landscapes.', icon: 'mix', interests: ['Heritage & Architecture', 'Adventure & Trekking', 'Mountains & Hills'] },
  { focus: 'Family with kids', title: 'Family & kids', summary: 'Choose wildlife, gardens, gentle outings and short days.', icon: 'kids', district: 'Mysuru', interests: ['Wildlife & Nature', 'Weekend Getaways', 'Heritage & Architecture'] },
  { focus: 'Women-only group', title: 'Women’s group trip', summary: 'Plan together with practical check-ins and emergency links.', icon: 'safety', interests: ['Heritage & Architecture', 'Weekend Getaways'] },
];

export function districtSearchUrl(kind: 'hotels' | 'restaurants' | 'things to do' | 'tour packages', district: string) {
  const town = district === 'Bengaluru South' || district === 'Ramanagara' ? 'Ramanagara, Karnataka' : `${district}, Karnataka`;
  return `https://www.google.com/maps/search/${encodeURIComponent(`${kind} in ${town}`)}`;
}
