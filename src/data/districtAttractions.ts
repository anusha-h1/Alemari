export type DistrictAttraction = { name: string; kind: string };
export type DistrictGuide = { center: [number, number]; source: string; attractions: DistrictAttraction[] };

const guide = (center: [number, number], slug: string, attractions: [string, string][]): DistrictGuide => ({
  center,
  source: `https://karnatakatourism.org/en/destinations/${slug}/`,
  attractions: attractions.map(([name, kind]) => ({ name, kind })),
});

// Curated from Karnataka Tourism and district administration visitor guides.
// Coordinates mark district headquarters for map orientation, not district borders.
export const districtAttractions: Record<string, DistrictGuide> = {
  'Bagalkote': guide([16.18, 75.70], 'bagalkote', [['Badami Cave Temples', 'Caves & heritage'], ['Pattadakal', 'UNESCO temple complex'], ['Aihole', 'Ancient temples'], ['Kudalasangama', 'Pilgrimage & river confluence']]),
  'Ballari': guide([15.14, 76.92], 'ballari', [['Ballari Fort', 'Fort & viewpoints'], ['Kumbara Gudda', 'Hill walk'], ['Mincheri Hill', 'Viewpoint'], ['Sandur', 'Hills & temples']]),
  'Belagavi': guide([15.85, 74.50], 'belagavi', [['Belagavi Fort', 'Fort & heritage'], ['Gokak Falls', 'Waterfall'], ['Kittur Fort and Palace', 'History'], ['Godachinmalki Falls', 'Waterfall']]),
  'Bengaluru Rural': guide([13.23, 77.71], 'bengaluru-rural', [['Devanahalli Fort', 'Fort & heritage'], ['Ghati Subramanya Temple', 'Temple'], ['Makalidurga Hill', 'Trek & hill fort'], ['Avati Hill', 'Nature & views']]),
  'Bengaluru South': guide([12.72, 77.28], 'ramanagara', [['Ramadevara Betta', 'Hill & trek'], ['Janapada Loka', 'Folk museum'], ['Mekedatu', 'River gorge'], ['Channapatna Toy Town', 'Crafts & family stop']]),
  'Bengaluru Urban': guide([12.97, 77.59], 'bengaluru', [['Bengaluru Palace', 'Palace & heritage'], ['Lalbagh Botanical Garden', 'Garden'], ['Cubbon Park', 'Park & museum district'], ['Tipu Sultan’s Summer Palace', 'Palace & history']]),
  'Bidar': guide([17.91, 77.52], 'bidar', [['Bidar Fort', 'Fort & heritage'], ['Bahmani Tombs at Ashtur', 'Historic tombs'], ['Nanak Jhira Sahib', 'Gurdwara & spring'], ['Rangeen Mahal', 'Palace & museum']]),
  'Chamarajanagar': guide([11.92, 76.94], 'chamarajanagar', [['Bandipur Tiger Reserve', 'Wildlife & safari'], ['Biligiri Ranganatha Hills', 'Temple & reserve'], ['Male Mahadeshwara Hills', 'Pilgrimage & hills'], ['Bharachukki Falls', 'Waterfall']]),
  'Chikkaballapur': guide([13.44, 77.73], 'chikkaballapur', [['Nandi Hills', 'Hill & viewpoints'], ['Skandagiri', 'Trek'], ['Bhoga Nandeeshwara Temple', 'Temple & architecture'], ['Muddenahalli', 'Museum & heritage']]),
  'Chikkamagaluru': guide([13.32, 75.77], 'chikkamagalur', [['Mullayanagiri', 'Mountain & trek'], ['Baba Budangiri', 'Hills & shrine'], ['Kudremukh National Park', 'Nature & trekking'], ['Hebbe Falls', 'Waterfall']]),
  'Chitradurga': guide([14.23, 76.40], 'chitradurga', [['Chitradurga Fort', 'Fort & heritage'], ['Chandravalli Caves', 'Caves & archaeology'], ['Hidimbeshwara Temple', 'Temple'], ['Vani Vilas Sagar Dam', 'Lake & dam']]),
  'Dakshina Kannada': guide([12.87, 74.88], 'dakshina-kannada', [['Dharmasthala Manjunatha Temple', 'Temple'], ['Kudroli Gokarnath Temple', 'Temple & architecture'], ['Panambur Beach', 'Beach'], ['Pilikula Nisargadhama', 'Zoo, science centre & lake']]),
  'Davanagere': guide([14.47, 75.92], 'davanagere', [['Kunduvada Lake', 'Lake & sunset'], ['Harihareshwara Temple', 'Temple & heritage'], ['Shantisagara (Sulekere)', 'Lake & nature'], ['Anjaneya Temple, Nittuvalli', 'Temple']]),
  'Dharwad': guide([15.46, 75.01], 'dharwad', [['Amruteshwara Temple, Annigeri', 'Temple & heritage'], ['Chandramouleshwara Temple, Hubballi', 'Temple & architecture'], ['Nrupatunga Betta', 'Hill viewpoint'], ['Unkal Lake', 'Lake & family outing']]),
  'Gadag': guide([15.43, 75.63], 'gadag', [['Binkadakatti Zoo', 'Zoo & family outing'], ['Kappatagudda Wildlife Sanctuary', 'Hills & nature'], ['Trikuteshwara Temple', 'Temple & heritage'], ['Lakkundi temples and stepwells', 'Heritage walk'], ['Magadi Bird Sanctuary', 'Birdwatching']]),
  'Hassan': guide([13.00, 76.10], 'hassan', [['Belur Chennakeshava Temple', 'Hoysala heritage'], ['Halebeedu Hoysaleswara Temple', 'Hoysala heritage'], ['Shravanabelagola', 'Jain pilgrimage'], ['Manjarabad Fort', 'Fort & viewpoints']]),
  'Haveri': guide([14.80, 75.40], 'haveri', [['Ranebennur Blackbuck Sanctuary', 'Wildlife'], ['Bankapura Peacock Sanctuary', 'Birdwatching'], ['Siddhesvara Temple, Haveri', 'Temple & heritage'], ['Galageshwara Temple, Galaganatha', 'Chalukyan temple']]),
  'Kalaburagi': guide([17.33, 76.83], 'kalaburagi', [['Kalaburagi Fort', 'Fort & heritage'], ['Khwaja Bande Nawaz Dargah', 'Sufi heritage'], ['Sharana Basaveshwara Temple', 'Temple'], ['Sannati Buddhist site', 'Archaeology']]),
  'Kodagu': guide([12.42, 75.74], 'kodagu', [['Madikeri Fort', 'Fort & museum'], ['Abbey Falls', 'Waterfall'], ['Talacauvery', 'River source & temple'], ['Dubare Elephant Camp', 'Wildlife & family outing']]),
  'Kolar': guide([13.14, 78.13], 'kolar', [['Antaragange', 'Caves & trek'], ['Kolaramma Temple', 'Temple & heritage'], ['Someshwara Temple', 'Temple & architecture'], ['Avani', 'Temple & hill']]),
  'Koppal': guide([15.35, 76.15], 'koppal', [['Itagi Mahadeva Temple', 'Chalukyan heritage'], ['Koppal Fort', 'Fort & viewpoints'], ['Kanakagiri', 'Temple & heritage'], ['Anegundi', 'Historic village & river']]),
  'Mandya': guide([12.52, 76.90], 'mandya', [['Srirangapatna', 'Island town & heritage'], ['Ranganathittu Bird Sanctuary', 'Birdwatching & boat ride'], ['Brindavan Gardens and KRS Dam', 'Garden & dam'], ['Melukote', 'Temple town & hill']]),
  'Mysuru': guide([12.30, 76.64], 'mysuru', [['Mysore Palace', 'Palace & heritage'], ['Mysuru Zoo', 'Zoo & family outing'], ['Chamundi Hill', 'Temple & viewpoint'], ['Karanji Lake Nature Park', 'Birds & nature']]),
  'Raichur': guide([16.20, 77.37], 'raichur', [['Raichur Fort', 'Fort & heritage'], ['Jaladurga Fort', 'Island fort'], ['Gundlabanda Waterfalls', 'Waterfall'], ['Narada Gadde', 'River island & pilgrimage']]),
  'Shivamogga': guide([13.93, 75.57], 'shivamogga', [['Jog Falls', 'Waterfall'], ['Sakrebailu Elephant Camp', 'Wildlife & family outing'], ['Keladi Museum and Rameshwara Temple', 'Heritage'], ['Kavaledurga Fort', 'Hill fort & trek']]),
  'Tumakuru': guide([13.34, 77.10], 'tumakuru', [['Madhugiri Fort', 'Hill fort & trek'], ['Devarayanadurga', 'Hill temples & nature'], ['Siddaganga Mutt', 'Spiritual & cultural visit'], ['Namada Chilume', 'Spring & nature']]),
  'Udupi': guide([13.34, 74.75], 'udupi', [['Udupi Sri Krishna Temple', 'Temple'], ['Malpe Beach and St. Mary’s Island', 'Beach & island'], ['Kaup Lighthouse Beach', 'Beach & lighthouse'], ['Hasta Shilpa Heritage Village', 'Museum & heritage']]),
  'Uttara Kannada': guide([14.81, 74.13], 'uttara-kannada', [['Dandeli Wildlife Sanctuary', 'Wildlife & river'], ['Yana Caves', 'Rock formations & trek'], ['Gokarna and Om Beach', 'Temple town & beaches'], ['Mirjan Fort', 'Coastal fort']]),
  'Vijayanagara': guide([15.27, 76.39], 'vijayanagara', [['Hampi Group of Monuments', 'UNESCO heritage'], ['Virupaksha Temple', 'Temple & heritage'], ['Vijaya Vittala Temple and Stone Chariot', 'Architecture'], ['Matanga Hill', 'Sunrise hike & views']]),
  'Vijayapura': guide([16.83, 75.71], 'vijayapura', [['Gol Gumbaz', 'Monument & whispering gallery'], ['Ibrahim Rauza', 'Tomb & architecture'], ['Malik-e-Maidan', 'Historic cannon'], ['Jama Masjid', 'Historic mosque']]),
  'Yadgir': guide([16.77, 77.14], 'yadgiri', [['Yadgir Fort', 'Fort & viewpoints'], ['Sannati Chandralamba Temple and Buddhist site', 'Temple & archaeology'], ['Narayanpur (Basava Sagar) Dam', 'Dam & reservoir'], ['Shorapur Fort', 'Fort & heritage']]),
};

export function districtMapUrl(place: string, district: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place}, ${district}, Karnataka`)}`;
}
