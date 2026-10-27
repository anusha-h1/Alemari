# ALEMARI — Delivery Outcomes

## 1. Premium identity, responsive navigation, and cinematic hero
- [x] Deliver ALEMARI / ಅಲೆಮಾರಿ with Kannada tagline “ಹೊಸ ತಾಣಗಳು, ಹೊಸ ಅನುಭವಗಳು.” and English tagline “Discover Karnataka. Experience More. Keep Every Memory.”
- [x] Use forest green #173D32, deep forest #102820, warm cream #F8F6F0, sand gold #E8CD91, terracotta #C87552, and soft sage #DCE6D8, with elegant serif display text, clean sans-serif body text, correctly rendered Kannada typography, premium travel-editorial layouts, cinematic imagery, spacious hierarchy, restrained shadows, and subtle transitions. Avoid generic dashboards, clutter, excessive gradients, neon, and unnecessary borders.
- [x] Implement a sticky, unobtrusive navigation with compass/mountain brand mark, Kannada name, Home, Discover Places, Karnataka Map, My Memories, Travel Calendar, and AI Travel Buddy links; active-section indication; responsive mobile menu; favorites shortcut; and functional Plan My Trip CTA.
- [x] Make an edge-to-edge hero with a Karnataka landscape photograph or permitted optional video, dark overlay, Kannada heading “ನಿಮ್ಮ ಮುಂದಿನ ಪಯಣ ಇಲ್ಲಿಂದ ಆರಂಭ.”, English heading “Your Next Adventure Starts Here.”, supporting text “From misty mountains and golden beaches to ancient kingdoms and hidden waterfalls, discover Karnataka your way.”, Explore Karnataka / Plan My Journey / Relive My Memories actions, animated scroll cue, destination search, and compact trip-planning entry for interests, budget, and available days. All actions navigate or perform meaningful work.
- [x] Use distinct real destination-specific photography from reliable public sources, prioritize official Karnataka tourism, Wikimedia Commons, Unsplash, or Pexels where suitable; use meaningful alt text, responsive sizing, lazy loading, dark overlays as needed, and graceful fallback for loading errors. Avoid broken URLs, irrelevant stock images, watermarks, and repetitive placeholders.
- [x] Use video only when the Karnataka footage source permits embedding or reuse; include poster, muted autoplay/loop/playsInline where supported, static fallback, reduced-motion handling, and pause control for prominent movement. The site must remain fully usable without video.

## 2. Destination discovery, stories, search, filters, and Surprise Me
- [x] Populate at least 15 authentic Karnataka destinations with destination name, Kannada name where available, district/region, accurate approximate coordinates, category/tags, description, recommended visit duration, approximate budget, and destination-specific photograph. Include Hampi, Coorg, Gokarna, Mysuru, Chikmagalur, Jog Falls, Badami, Udupi, Murudeshwar, Dandeli, Kudremukh, Belur, Halebidu, Pattadakal, Shivamogga, and Kabini.
- [x] Display clickable experience tiles for Mountains and hill stations; Beaches and coastal escapes; Waterfalls and rivers; Heritage and architecture; Temples and spiritual journeys; Wildlife and forests; Food and local culture; Adventure and trekking; Peaceful weekend getaways; and Hidden gems. Selecting a category filters the destination collection.
- [x] Provide functional search and filters for destination, category, region, and approximate budget.
- [x] Destination cards show a large photograph, English and Kannada name where available, district/region, short description, category tags, recommended duration, approximate budget, favorite action, Explore Details, Mark as Visited, and Add to My Trip. Synchronize their selected/visited/favorite state with other sections.
- [x] Add alternating full-width destination stories, including “HAMPI — Where History Comes Alive”, “COORG — Escape Into the Hills”, and “GOKARNA — Find Your Coastal Escape”, with the specified history/hills/coast narrative content and a working Explore This Place action that opens details.
- [x] Implement Surprise Me using chosen category, available days, and approximate budget. Reveal a matching destination from the local dataset with photograph, name, why it fits, suggested duration, approximate budget, Discover Another Place, and Add to My Trip actions; do not generate arbitrary filler.

## 3. Frontend trip planner and saved trips
- [x] Provide a functional planning wizard with trip details (starting city; destination or Surprise Me; start and end date; traveller count; available days), multi-select interests (nature, beaches, waterfalls, heritage, adventure, wildlife, food, spiritual experiences, hidden gems), and budget/style options (INR budget; budget-friendly/moderate/premium; relaxed/balanced/adventure-packed; transport preference; accommodation preference).
- [x] Generate a local day-by-day itinerary from the destination dataset with morning, afternoon, and evening activities, suggested destinations, destination photos, approximate travel costs, approximate food and accommodation expenses, estimated total, and travel tips; calculate costs using traveller count, style, pace, transport, and accommodation choices, while keeping the estimated total within the selected budget.
- [x] Provide working Regenerate Itinerary, Change Budget, Make More Adventurous, Add Hidden Gems, Save Trip, and Add Destinations to Favourites actions. Persist saved trips locally and show them in the personal profile.
- [x] Persist the full planner settings—starting city, destination, start/end dates, travellers, available days, interests, INR budget, style, pace, transport, and accommodation—in browser-local preferences; restore them when reopening the planner, keep settings through refreshes, and remove them when clearing local data.
- [x] Clearly label costs as approximate and explain that live availability and real-time prices are not connected.

## 4. Interactive Karnataka map
- [x] Implement a real React Leaflet / Leaflet map using OpenStreetMap tiles, centered on Karnataka, with correctly positioned destination markers using real approximate coordinates. Do not draw an invented Karnataka boundary; use a genuine suitable GeoJSON boundary only if available.
- [x] Distinguish visited and unvisited markers; include map legend, zoom controls, reset-to-Karnataka view, search, category filters, and visited-only filter.
- [x] Marker selection opens a destination detail popup/side panel showing name, image, region, description, category, visit duration, approximate budget, and visited state, with working Explore Details, Add to Trip, Mark as Visited, and View Memories actions.
- [x] Synchronize cards and markers: selecting a card highlights its marker, selecting a marker highlights its destination in discovery, and visited markers make saved memories easy to open.
- [x] Include Leaflet CSS/markers, tile attribution, responsive sizing, and graceful loading/tile error states.

## 5. Personal travel journal and local persistence
- [x] Use TypeScript models and one shared local memory store so gallery, calendar, timeline, statistics and destination views remain synchronized.
- [x] Add Memory form accepts title, destination, date visited, multiple photos, caption, full experience/story, favourite moment, optional rating, travel companions, and tags such as nature, adventure, food, friends, family, and solo travel.
- [x] Accept JPG, PNG, and WebP; validate type and size; preview multiple photos before saving; allow photo removal; store image blobs locally in IndexedDB, not in an external service; keep text and memory metadata in appropriate browser storage; preserve saved memories after refresh; and show clear success feedback.
- [x] Show journal cards with cover photo, destination, title, visit date, caption, favourite moment, and Read Story. Detail view shows full story, photo gallery with next/previous navigation, destination details, date, rating, tags, Edit Memory, and Delete Memory with confirmation. Provide an accessible keyboard-operable lightbox where practical.
- [x] Make create/read/edit/delete work. Editing updates gallery, timeline and calendar; deletion removes the memory from every view.
- [x] Provide JSON export of memory metadata and confirmation before clearing all locally saved memories. Explain that memories are stored in this browser and are not automatically synchronized between devices; never imply cloud storage.

## 6. Travel calendar and timeline
- [x] Calendar has month/year navigation, previous/next, Today, past-year browsing, memory-date highlights and small image thumbnails or indicators, multiple memories per date, date selection that lists that date’s memories, and memory-to-detail navigation.
- [x] Empty date offers Add Memory with selected date prefilled; the calendar supports a Calendar View / Timeline View switch and derives all events from shared local memory data, updating on every create/edit/delete.
- [x] Timeline is chronological and shows visit date, destination, destination image or saved photo, title, story preview, favourite moment, and a location marker/connecting line.
- [x] Timeline filters by year, destination, category, and favourites; sorts newest-first or oldest-first; and opens the full memory when an entry is selected.
- [x] Empty timeline displays “Your next adventure could become your favourite memory.” and a functional Add First Memory action.

## 7. Alemari Mitra local travel assistant
- [x] Provide a floating assistant button throughout the site for “ಅಲೆಮಾರಿ ಮಿತ್ರ — Alemari Mitra”, friendly travel-companion styling, animated chat panel, greeting, message bubbles, suggested question chips, typing indicator, scrollable session history, text input/send, clear conversation, and close/reopen controls.
- [x] Include suggested prompts for weekend Karnataka plans; two-day trip under ₹3,000; peaceful places near Coorg; waterfalls; family trip; hidden gems; heritage around Hampi and Badami; interests-based suggestions; and next places based on visited destinations.
- [x] Implement a local deterministic/rule-based response service that recognizes common destinations and categories, recommends suitable places, creates simple itineraries, gives approximate budget ranges, uses interests and available days, uses visited destinations to suggest new places, and gives a helpful fallback. Do not claim a live AI model is connected or return random generic filler.
- [x] Keep the assistant behind a clean service interface ready for later secure backend/AI integration; do not expose keys or call a paid API.

## 8. Local travel profile, statistics, and footer
- [x] Calculate places visited, memories saved, photos collected, districts explored where metadata supports it, favourite destination, most visited experience category, and saved trips from the actual locally saved data; update automatically on relevant user actions, without hardcoded statistics.
- [x] Include My Karnataka Map shortcut to show only visited destinations.
- [x] Footer includes ALEMARI, navigation links, short description, “ಪ್ರತಿ ಪಯಣವೂ ಒಂದು ಕಥೆ.” and “Every journey deserves to be remembered.”

## 9. Accessibility, responsive behavior, and complete delivery
- [x] Support desktop-first premium layouts and mobile/tablet, responsive nav, map and destination details, touch-friendly controls, accessible form labels, keyboard navigation, clear focus indicators, sufficient contrast, meaningful empty states, loading skeletons, image error fallbacks, reduced motion, and clear success/error feedback.
- [x] Use React state and reusable handlers; every visible button, filter, search, tab, marker, calendar control, and form submission has a working action.
- [x] Keep source maintainable and ready for a future Python FastAPI backend; separate destination data, models, local storage services, hooks, UI, map utilities, itinerary generation, assistant logic, and shared types.
- [x] Add the FastAPI backend in `backend/` with a Karnataka destination catalogue, destination search, budget-aware itinerary endpoint, deterministic travel chat endpoint, and SQLite CRUD for trip and memory metadata. Connect the frontend assistant to the API with local-response fallback; keep personal stories and photos browser-local.
- [x] Inspect the initialized repository and dependencies before implementation; preserve working code. Install required dependencies, add realistic Karnataka destination data and quality imagery, implement the interactive map/planner/photo persistence/gallery/calendar/timeline/assistant/filters/favorites/visited states, run diagnostics and production build, fix errors, and verify important interactions and responsive/image fallback paths.
- [x] Provide exact Windows PowerShell commands for starting the app and building it.
- [x] Central flow works end-to-end: Discover Karnataka → Explore the Map → Plan a Trip → Visit a Place → Upload Photos → Write Your Story → Revisit Memories → Discover the Next Adventure.
