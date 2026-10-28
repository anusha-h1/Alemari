import type { Destination } from '../types';
import districtDestinations from '../../data/district-destinations.json';
import { additionalDestinations } from './additionalDestinations';

const featuredDestinations: Destination[] = [
  {
    id: 'hampi', name: 'Hampi', kannada: 'ಹಂಪಿ', district: 'Vijayanagara', region: 'North Karnataka',
    lat: 15.3350, lng: 76.4600, category: 'Heritage & Architecture', tags: ['heritage', 'boulders', 'history', 'hidden gems'],
    image: '/images/destinations/hampi.jpg', description: 'Trace the vast stone city of the Vijayanagara empire, where ancient temples meet a landscape of granite boulders.',
    duration: '2–3 days', days: 2, budgetMin: 4500, budgetMax: 10500, highlights: ['Virupaksha Temple', 'Vittala Temple', 'Matanga Hill'],
    storyTitle: 'Where History Comes Alive', story: 'Walk among the magnificent ruins of the Vijayanagara Empire and discover centuries of history, carved stone by carved stone. Take the cooler morning hours slowly, linger over the river and keep an evening for the view from Matanga Hill.',
  },
  {
    id: 'coorg', name: 'Coorg', kannada: 'ಕೊಡಗು', district: 'Kodagu', region: 'Western Ghats',
    lat: 12.3375, lng: 75.8069, category: 'Mountains & Hills', tags: ['nature', 'coffee', 'waterfalls', 'weekend'],
    image: '/images/destinations/coorg.jpg', description: 'Take the winding highland roads through Kodagu, a coffee country of rain-fed forests, waterfalls and layered hills.',
    duration: '2–3 days', days: 2, budgetMin: 5000, budgetMax: 14000, highlights: ['Abbey Falls', 'Madikeri Fort', 'Coffee estate walks'],
    storyTitle: 'Escape Into the Hills', story: 'Wake up to mist-covered hills, coffee plantations, and the quiet beauty of the Western Ghats. Coorg is best explored without rushing: follow an estate trail, pause at a waterfall and let a Kodava meal become part of the journey.',
  },
  {
    id: 'gokarna', name: 'Gokarna', kannada: 'ಗೋಕರ್ಣ', district: 'Uttara Kannada', region: 'Karavali Coast',
    lat: 14.5479, lng: 74.3188, category: 'Beaches & Coast', tags: ['beach', 'coast', 'weekend', 'spiritual'],
    image: '/images/destinations/gokarna.jpg', description: 'Find a quieter stretch of Karnataka’s coast, where beach paths, rocky headlands and a temple town shape the day.',
    duration: '2 days', days: 2, budgetMin: 3500, budgetMax: 9000, highlights: ['Om Beach', 'Kudle Beach', 'Mahabaleshwar Temple'],
    storyTitle: 'Find Your Coastal Escape', story: 'Discover beaches, scenic paths and unhurried sunsets along Karnataka’s coast. Start at the town before the heat and set aside time for the coastal trail; conditions and access can change with the season.',
  },
  {
    id: 'mysuru', name: 'Mysuru', kannada: 'ಮೈಸೂರು', district: 'Mysuru', region: 'South Karnataka',
    lat: 12.2958, lng: 76.6394, category: 'Heritage & Architecture', tags: ['palace', 'culture', 'food', 'history'],
    image: '/images/destinations/mysuru.jpg', description: 'An elegant city of royal architecture, shaded boulevards, markets and a living food culture.',
    duration: '1–2 days', days: 1, budgetMin: 2500, budgetMax: 8000, highlights: ['Mysore Palace', 'Devaraja Market', 'Chamundi Hill'],
  },
  {
    id: 'chikmagalur', name: 'Chikmagalur', kannada: 'ಚಿಕ್ಕಮಗಳೂರು', district: 'Chikkamagaluru', region: 'Western Ghats',
    lat: 13.3153, lng: 75.7754, category: 'Mountains & Hills', tags: ['mountain', 'coffee', 'trek', 'nature'],
    image: '/images/destinations/chikmagalur.jpg', description: 'Follow mountain roads into the coffee-growing highlands, with sunrise viewpoints and green ridgelines.',
    duration: '2–3 days', days: 2, budgetMin: 4500, budgetMax: 12000, highlights: ['Mullayanagiri', 'Baba Budangiri', 'Coffee estates'],
  },
  {
    id: 'jog-falls', name: 'Jog Falls', kannada: 'ಜೋಗ ಜಲಪಾತ', district: 'Shivamogga', region: 'Malnad',
    lat: 14.2290, lng: 74.8113, category: 'Waterfalls & Rivers', tags: ['waterfall', 'monsoon', 'nature'],
    image: '/images/destinations/jog-falls.jpg', description: 'Watch the Sharavathi River plunge through a forested gorge; waterfall volume changes with the season and dam releases.',
    duration: '1 day', days: 1, budgetMin: 1500, budgetMax: 4500, highlights: ['Jog viewpoint', 'Sharavathi valley', 'Nearby viewpoints'],
  },
  {
    id: 'badami', name: 'Badami', kannada: 'ಬಾದಾಮಿ', district: 'Bagalkote', region: 'North Karnataka',
    lat: 15.9149, lng: 75.6768, category: 'Heritage & Architecture', tags: ['caves', 'heritage', 'temples', 'history'],
    image: '/images/destinations/badami.jpg', description: 'Explore rock-cut cave sanctuaries and sandstone cliffs overlooking the Agastya lake.',
    duration: '1–2 days', days: 1, budgetMin: 2500, budgetMax: 6500, highlights: ['Badami cave temples', 'Agastya Lake', 'Bhoothanatha temples'],
  },
  {
    id: 'udupi', name: 'Udupi', kannada: 'ಉಡುಪಿ', district: 'Udupi', region: 'Karavali Coast',
    lat: 13.3409, lng: 74.7421, category: 'Temples & Spiritual', tags: ['temple', 'coast', 'food', 'culture'],
    image: '/images/destinations/udupi.jpg', description: 'A coastal town known for its Krishna temple, distinctive vegetarian cuisine and easy access to beaches.',
    duration: '1–2 days', days: 1, budgetMin: 2200, budgetMax: 7000, highlights: ['Sri Krishna Matha', 'Malpe Beach', 'Local Udupi cuisine'],
  },
  {
    id: 'murudeshwar', name: 'Murudeshwar', kannada: 'ಮುರುಡೇಶ್ವರ', district: 'Uttara Kannada', region: 'Karavali Coast',
    lat: 14.0937, lng: 74.4840, category: 'Temples & Spiritual', tags: ['temple', 'coast', 'culture'],
    image: '/images/destinations/murudeshwar.jpg', description: 'A dramatic seaside setting where a major Shiva temple complex looks out over the Arabian Sea.',
    duration: '1 day', days: 1, budgetMin: 1800, budgetMax: 5500, highlights: ['Murudeshwar Temple', 'Arabian Sea views', 'Coastal sunset'],
  },
  {
    id: 'dandeli', name: 'Dandeli', kannada: 'ದಾಂಡೇಲಿ', district: 'Uttara Kannada', region: 'Western Ghats',
    lat: 15.2472, lng: 74.6290, category: 'Adventure & Trekking', tags: ['rafting', 'forest', 'river', 'wildlife'],
    image: '/images/destinations/dandeli.jpg', description: 'A forest-and-river escape on the Kali, popular for outdoor activities and quiet nature trails.',
    duration: '2 days', days: 2, budgetMin: 3500, budgetMax: 10000, highlights: ['Kali river rafting', 'Dandeli wildlife sanctuary', 'Forest walks'],
  },
  {
    id: 'kudremukh', name: 'Kudremukh', kannada: 'ಕುದುರೆಮುಖ', district: 'Chikkamagaluru', region: 'Western Ghats',
    lat: 13.2290, lng: 75.1994, category: 'Adventure & Trekking', tags: ['trek', 'mountain', 'nature', 'hidden gems'],
    image: '/images/destinations/kudremukh.jpg', description: 'A sweep of protected Western Ghats grassland and forest, with trekking access governed by local permits and conditions.',
    duration: '2 days', days: 2, budgetMin: 3500, budgetMax: 8500, highlights: ['Kudremukh peak trail', 'National Park', 'Western Ghats viewpoints'],
  },
  {
    id: 'belur', name: 'Belur', kannada: 'ಬೇಲೂರು', district: 'Hassan', region: 'South Karnataka',
    lat: 13.1629, lng: 75.8653, category: 'Heritage & Architecture', tags: ['temple', 'heritage', 'architecture'],
    image: '/images/destinations/belur.jpg', description: 'Study the intricate stonework of the Hoysala-era Chennakeshava Temple in a historic riverside town.',
    duration: 'Half day', days: 1, budgetMin: 1200, budgetMax: 3500, highlights: ['Chennakeshava Temple', 'Hoysala sculpture', 'Yagachi river landscape'],
  },
  {
    id: 'halebidu', name: 'Halebidu', kannada: 'ಹಳೇಬೀಡು', district: 'Hassan', region: 'South Karnataka',
    lat: 13.2120, lng: 75.9948, category: 'Heritage & Architecture', tags: ['temple', 'heritage', 'architecture'],
    image: '/images/destinations/halebidu.jpg', description: 'Discover expressive Hoysala carvings at the Hoysaleshwara temple in a serene historic setting.',
    duration: 'Half day', days: 1, budgetMin: 1200, budgetMax: 3500, highlights: ['Hoysaleshwara Temple', 'Stone friezes', 'Hoysala heritage'],
  },
  {
    id: 'pattadakal', name: 'Pattadakal', kannada: 'ಪಟ್ಟದಕಲ್ಲು', district: 'Bagalkote', region: 'North Karnataka',
    lat: 15.9482, lng: 75.8160, category: 'Heritage & Architecture', tags: ['UNESCO', 'temples', 'heritage', 'architecture'],
    image: '/images/destinations/pattadakal.jpg', description: 'Visit a celebrated group of early Chalukyan temples with striking northern and southern architectural forms.',
    duration: 'Half day', days: 1, budgetMin: 1200, budgetMax: 3500, highlights: ['Virupaksha Temple', 'Mallikarjuna Temple', 'Chalukyan sculpture'],
  },
  {
    id: 'shivamogga', name: 'Shivamogga', kannada: 'ಶಿವಮೊಗ್ಗ', district: 'Shivamogga', region: 'Malnad',
    lat: 13.9299, lng: 75.5681, category: 'Waterfalls & Rivers', tags: ['waterfall', 'nature', 'river', 'hidden gems'],
    image: '/images/destinations/shivamogga.jpg', description: 'Use this leafy Malnad city as a base for rivers, cascades and nearby Western Ghats landscapes.',
    duration: '1–2 days', days: 1, budgetMin: 1800, budgetMax: 5000, highlights: ['Achakanya Falls', 'Tunga River', 'Nearby Malnad routes'],
  },
  {
    id: 'kabini', name: 'Kabini', kannada: 'ಕಬಿನಿ', district: 'Mysuru', region: 'South Karnataka',
    lat: 11.9500, lng: 76.2650, category: 'Wildlife & Nature', tags: ['wildlife', 'forest', 'river', 'safari'],
    image: '/images/destinations/kabini.jpg', description: 'A forest-and-water landscape on the Kabini, with guided wildlife experiences subject to park schedules and availability.',
    duration: '2 days', days: 2, budgetMin: 7000, budgetMax: 22000, highlights: ['Kabini backwaters', 'Guided safari', 'Forest lodges'],
  },
];

export const destinations: Destination[] = [...featuredDestinations, ...(districtDestinations as Destination[]), ...additionalDestinations];

export const destinationById = (id: string) => destinations.find((destination) => destination.id === id);
