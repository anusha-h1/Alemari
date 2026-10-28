"""Small, persistent API for the ALEMARI Karnataka travel planner."""

from __future__ import annotations

import json
import os
import sqlite3
from contextlib import asynccontextmanager, contextmanager
from pathlib import Path
from typing import Any
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

ROOT = Path(__file__).resolve().parent
DB_PATH = Path(os.environ.get("ALEMARI_DB_PATH", ROOT / "alemari.sqlite3"))

DESTINATIONS = [
    {"id":"hampi","name":"Hampi","district":"Vijayanagara","region":"North Karnataka","lat":15.335,"lng":76.46,"category":"Heritage & Architecture","tags":["heritage","history","hidden gems"],"days":2,"budgetMin":4500,"budgetMax":10500,"highlights":["Virupaksha Temple","Vittala Temple","Matanga Hill"]},
    {"id":"coorg","name":"Coorg","district":"Kodagu","region":"Western Ghats","lat":12.3375,"lng":75.8069,"category":"Mountains & Hills","tags":["nature","coffee","waterfalls"],"days":2,"budgetMin":5000,"budgetMax":14000,"highlights":["Abbey Falls","Madikeri Fort","Coffee estate walks"]},
    {"id":"gokarna","name":"Gokarna","district":"Uttara Kannada","region":"Karavali Coast","lat":14.5479,"lng":74.3188,"category":"Beaches & Coast","tags":["beach","coast","weekend"],"days":2,"budgetMin":3500,"budgetMax":9000,"highlights":["Om Beach","Kudle Beach","Mahabaleshwar Temple"]},
    {"id":"mysuru","name":"Mysuru","district":"Mysuru","region":"South Karnataka","lat":12.2958,"lng":76.6394,"category":"Heritage & Architecture","tags":["palace","culture","food"],"days":1,"budgetMin":2500,"budgetMax":8000,"highlights":["Mysore Palace","Devaraja Market","Chamundi Hill"]},
    {"id":"chikmagalur","name":"Chikmagalur","district":"Chikkamagaluru","region":"Western Ghats","lat":13.3153,"lng":75.7754,"category":"Mountains & Hills","tags":["mountain","coffee","trek"],"days":2,"budgetMin":4500,"budgetMax":12000,"highlights":["Mullayanagiri","Baba Budangiri","Coffee estates"]},
    {"id":"jog-falls","name":"Jog Falls","district":"Shivamogga","region":"Malnad","lat":14.229,"lng":74.8113,"category":"Waterfalls & Rivers","tags":["waterfall","monsoon","nature"],"days":1,"budgetMin":1500,"budgetMax":4500,"highlights":["Jog viewpoint","Sharavathi valley","Nearby viewpoints"]},
    {"id":"badami","name":"Badami","district":"Bagalkote","region":"North Karnataka","lat":15.9149,"lng":75.6768,"category":"Heritage & Architecture","tags":["caves","heritage","temples"],"days":1,"budgetMin":2500,"budgetMax":6500,"highlights":["Badami cave temples","Agastya Lake","Bhoothanatha temples"]},
    {"id":"udupi","name":"Udupi","district":"Udupi","region":"Karavali Coast","lat":13.3409,"lng":74.7421,"category":"Temples & Spiritual","tags":["temple","coast","food"],"days":1,"budgetMin":2200,"budgetMax":7000,"highlights":["Sri Krishna Matha","Malpe Beach","Local Udupi cuisine"]},
    {"id":"murudeshwar","name":"Murudeshwar","district":"Uttara Kannada","region":"Karavali Coast","lat":14.0937,"lng":74.484,"category":"Temples & Spiritual","tags":["temple","coast","culture"],"days":1,"budgetMin":1800,"budgetMax":5500,"highlights":["Murudeshwar Temple","Arabian Sea views","Coastal sunset"]},
    {"id":"dandeli","name":"Dandeli","district":"Uttara Kannada","region":"North Karnataka","lat":15.2473,"lng":74.6295,"category":"Adventure & Trekking","tags":["adventure","rafting","wildlife"],"days":2,"budgetMin":4000,"budgetMax":11000,"highlights":["Kali River","Dandeli Wildlife Sanctuary","River activities"]},
    {"id":"kudremukh","name":"Kudremukh","district":"Chikkamagaluru","region":"Western Ghats","lat":13.1439,"lng":75.2749,"category":"Mountains & Hills","tags":["mountain","trek","nature"],"days":2,"budgetMin":3500,"budgetMax":9500,"highlights":["Kudremukh trek","Grassland trails","Western Ghats viewpoints"]},
    {"id":"belur","name":"Belur","district":"Hassan","region":"South Karnataka","lat":13.1627,"lng":75.8649,"category":"Heritage & Architecture","tags":["heritage","temple","architecture"],"days":1,"budgetMin":1800,"budgetMax":5000,"highlights":["Chennakesava Temple","Hoysala carvings","Yagachi River"]},
    {"id":"halebidu","name":"Halebidu","district":"Hassan","region":"South Karnataka","lat":13.2128,"lng":75.9942,"category":"Heritage & Architecture","tags":["heritage","temple","architecture"],"days":1,"budgetMin":1800,"budgetMax":5000,"highlights":["Hoysaleswara Temple","Kedareshwara Temple","Hoysala sculpture"]},
    {"id":"pattadakal","name":"Pattadakal","district":"Bagalkote","region":"North Karnataka","lat":15.9489,"lng":75.8163,"category":"Heritage & Architecture","tags":["heritage","temple","history"],"days":1,"budgetMin":2000,"budgetMax":5500,"highlights":["Pattadakal temples","Virupaksha Temple","Malaprabha riverbank"]},
    {"id":"shivamogga","name":"Shivamogga","district":"Shivamogga","region":"Malnad","lat":13.9299,"lng":75.5681,"category":"Waterfalls & Rivers","tags":["nature","waterfall","weekend"],"days":2,"budgetMin":3000,"budgetMax":8500,"highlights":["Jog Falls day trip","Sakrebailu Elephant Camp","Tyavarekoppa Safari"]},
    {"id":"kabini","name":"Kabini","district":"Mysuru","region":"South Karnataka","lat":11.966,"lng":76.3308,"category":"Wildlife & Nature","tags":["wildlife","forest","nature"],"days":2,"budgetMin":7000,"budgetMax":22000,"highlights":["Kabini backwaters","Wildlife safari","Forest landscape"]},
]
DESTINATIONS.extend(json.loads((ROOT.parent / "data" / "district-destinations.json").read_text(encoding="utf-8")))
DESTINATIONS.extend([
    {"id":"gadag-zoo","name":"Binkadakatti Zoo","district":"Gadag","region":"North Karnataka","lat":15.405,"lng":75.62,"category":"Wildlife & Nature","tags":["wildlife","zoo","kids","family"],"days":1,"budgetMin":500,"budgetMax":1800,"highlights":["Zoo and wildlife exhibits","Family outing","Gadag town"]},
    {"id":"mysuru-zoo","name":"Mysuru Zoo","district":"Mysuru","region":"South Karnataka","lat":12.3009,"lng":76.6653,"category":"Wildlife & Nature","tags":["wildlife","zoo","kids","family"],"days":1,"budgetMin":500,"budgetMax":2500,"highlights":["Sri Chamarajendra Zoological Gardens","Wildlife learning","Karanji Lake"]},
    {"id":"karanji-lake","name":"Karanji Lake Nature Park","district":"Mysuru","region":"South Karnataka","lat":12.2994,"lng":76.6699,"category":"Wildlife & Nature","tags":["lake","birds","kids","family","nature"],"days":1,"budgetMin":300,"budgetMax":1500,"highlights":["Lake and bird habitat","Family nature break","Near Mysuru Zoo"]},
])


@contextmanager
def connect():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH, timeout=10)
    db.row_factory = sqlite3.Row
    try:
        db.execute("PRAGMA journal_mode=WAL")
        db.execute("CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(kind, id))")
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    with connect() as db:
        db.execute("SELECT 1")
    yield


app = FastAPI(title="ALEMARI Travel API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALEMARI_CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(","),
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
)


class Record(BaseModel):
    model_config = ConfigDict(extra="allow")
    id: str | None = None


class ChatRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)
    interests: list[str] = Field(default_factory=list, max_length=20)
    visitedIds: list[str] = Field(default_factory=list, max_length=100)
    availableDays: int = Field(default=2, ge=1, le=10)
    memories: list[dict[str, Any]] = Field(default_factory=list, max_length=500)


class ItineraryRequest(BaseModel):
    startingCity: str = Field(default="Bengaluru", max_length=100)
    destinationId: str = Field(default="", max_length=100)
    startDate: str = ""
    endDate: str = ""
    travellers: int = Field(default=2, ge=1, le=30)
    availableDays: int = Field(default=2, ge=1, le=10)
    interests: list[str] = Field(default_factory=list, max_length=20)
    tripFocus: str = "Any of Karnataka"
    travellingWithChildren: bool = False
    budget: int = Field(default=6000, ge=0, le=100_000_000)
    style: str = "Budget-friendly"
    pace: str = "Balanced"
    transport: str = "Public transport"
    accommodation: str = "Guesthouse"
    seed: int = Field(default=0, ge=0, le=1_000_000)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "alemari-api", "version": app.version}


@app.get("/api/destinations")
def get_destinations(q: str | None = Query(default=None, max_length=100), category: str | None = None, limit: int = Query(default=100, ge=1, le=100)):
    items = DESTINATIONS
    if q:
        needle = q.casefold()
        items = [item for item in items if needle in item["name"].casefold() or needle in item["district"].casefold() or any(needle in tag for tag in item["tags"])]
    if category:
        items = [item for item in items if item["category"].casefold() == category.casefold()]
    return {"items": items[:limit], "total": len(items)}


@app.get("/api/destinations/{destination_id}")
def get_destination(destination_id: str):
    item = next((item for item in DESTINATIONS if item["id"] == destination_id), None)
    if not item:
        raise HTTPException(404, "Destination not found")
    return item


@app.post("/api/itinerary")
def generate_itinerary(request: ItineraryRequest):
    max_radius_km = 150
    south_districts = {"Mysuru", "Mandya", "Kodagu", "Chamarajanagar", "Tumakuru", "Hassan", "Kolar", "Chikkaballapur", "Bengaluru Rural", "Bengaluru Urban", "Bengaluru South"}
    north_districts = {"Bagalkote", "Ballari", "Belagavi", "Bidar", "Chitradurga", "Davanagere", "Dharwad", "Gadag", "Haveri", "Kalaburagi", "Koppal", "Raichur", "Vijayapura", "Vijayanagara", "Yadgir", "Shivamogga"}

    def in_focus(item: dict[str, Any]) -> bool:
        focus = request.tripFocus
        if focus == "South Karnataka":
            return item["region"] == "South Karnataka" or item["district"] in south_districts or item["district"].startswith("Bengaluru South")
        if focus == "North Karnataka":
            return item["region"] in {"North Karnataka", "Central Karnataka"} or item["district"] in north_districts
        if focus == "Coastal Karnataka":
            return item["district"] in {"Dakshina Kannada", "Udupi", "Uttara Kannada"} or item["region"] == "Karavali Coast"
        if focus == "Heritage & adventure":
            return item["category"] in {"Heritage & Architecture", "Adventure & Trekking", "Mountains & Hills"}
        if focus == "Family with kids" or request.travellingWithChildren:
            return bool(set(item["tags"]) & {"kids", "family"}) or item["district"] in {"Mysuru", "Gadag"} and item["category"] == "Wildlife & Nature"
        return True

    preferred = next((item for item in DESTINATIONS if item["id"] == request.destinationId), None)
    scoped = [item for item in DESTINATIONS if in_focus(item) or item is preferred]
    if not scoped:
        scoped = DESTINATIONS

    def distance_km(a: dict[str, Any], b: dict[str, Any]) -> float:
        from math import atan2, cos, radians, sin, sqrt
        lat_a, lat_b = radians(a["lat"]), radians(b["lat"])
        d_lat, d_lng = lat_b - lat_a, radians(b["lng"] - a["lng"])
        value = sin(d_lat / 2) ** 2 + cos(lat_a) * cos(lat_b) * sin(d_lng / 2) ** 2
        return 6371 * 2 * atan2(sqrt(value), sqrt(1 - value))

    start_cities = {
        "bengaluru": {"lat": 12.9716, "lng": 77.5946}, "bangalore": {"lat": 12.9716, "lng": 77.5946},
        "mysuru": {"lat": 12.2958, "lng": 76.6394}, "mysore": {"lat": 12.2958, "lng": 76.6394},
        "gadag": {"lat": 15.429, "lng": 75.63}, "hubballi": {"lat": 15.3647, "lng": 75.124}, "hubli": {"lat": 15.3647, "lng": 75.124},
        "dharwad": {"lat": 15.4589, "lng": 75.0078}, "mangaluru": {"lat": 12.9141, "lng": 74.856}, "mangalore": {"lat": 12.9141, "lng": 74.856},
        "udupi": {"lat": 13.3409, "lng": 74.7421}, "ballari": {"lat": 15.1394, "lng": 76.9214}, "hampi": {"lat": 15.335, "lng": 76.46},
    }
    start = start_cities.get(request.startingCity.strip().casefold())
    score = lambda item: (item is preferred, item["category"] in request.interests, item["budgetMin"] <= request.budget)
    ranked = sorted(scoped, key=lambda item: (not score(item)[0], not score(item)[1], not score(item)[2], item["name"]))
    local_to_start = [item for item in ranked if start and distance_km(start, item) <= max_radius_km]
    anchor = preferred or (local_to_start[0] if local_to_start else ranked[0])
    local_ranked = sorted((item for item in ranked if item is anchor or distance_km(anchor, item) <= max_radius_km), key=lambda item: (item is not anchor, distance_km(anchor, item), not score(item)[1]))
    local_ids = {item["id"] for item in local_ranked}
    local_extra = sorted((item for item in DESTINATIONS if item["id"] not in local_ids and distance_km(anchor, item) <= max_radius_km), key=lambda item: distance_km(anchor, item))
    route = local_ranked + local_extra
    if not route:
        route = [anchor]
    days = []
    for index in range(request.availableDays):
        place = route[index] if index < len(route) else route[index % len(route)]
        daily = min(request.budget // request.availableDays, round(((place["budgetMin"] + place["budgetMax"]) / 2 / max(place["days"], 1)) * request.travellers))
        travel, food = int(daily * .3), int(daily * .25)
        highlights = place["highlights"]
        days.append({"day": index + 1, "destinationIds": [place["id"]], "morning": (f"Set out from {request.startingCity} and arrive at " if index == 0 else "Begin early at ") + f"{place['name']}; visit {highlights[0]}.", "afternoon": f"Explore {highlights[1] if len(highlights) > 1 else highlights[0]} and leave time for lunch.", "evening": f"Wind down with {highlights[2] if len(highlights) > 2 else 'a relaxed local dinner'}.", "travelCost": travel, "foodCost": food, "stayCost": daily - travel - food, "tip": "Confirm local opening times, route conditions, and transport before travelling."})
    return {"days": days, "estimatedTotal": sum(day["travelCost"] + day["foodCost"] + day["stayCost"] for day in days), "approximate": True}


@app.post("/api/assistant/chat")
def chat(request: ChatRequest):
    question = request.question.casefold()
    matches = DESTINATIONS
    words = {"waterfall": "waterfall", "beach": "coast", "coast": "coast", "heritage": "heritage", "history": "heritage", "coffee": "coffee", "wildlife": "wildlife", "forest": "wildlife", "mountain": "mountain", "hill": "mountain", "hidden": "hidden", "trek": "trek", "adventure": "adventure"}
    keyword = next((value for key, value in words.items() if key in question), None)
    named = next((item for item in DESTINATIONS if item["name"].casefold() in question), None)
    if named:
        matches = [named] + [item for item in DESTINATIONS if item != named and set(item["tags"]) & set(named["tags"])]
    elif keyword:
        matches = [item for item in DESTINATIONS if keyword in " ".join([item["category"].casefold(), *item["tags"]])]
    elif request.interests:
        matches = [item for item in DESTINATIONS if item["category"] in request.interests]
    if any(word in question for word in ("next", "visited", "already")):
        fresh = [item for item in matches if item["id"] not in request.visitedIds]
        matches = fresh or [item for item in DESTINATIONS if item["id"] not in request.visitedIds]
    matches = matches[:3]
    if matches:
        answer = "You might enjoy " + "; ".join(f"{item['name']} ({item['category'].lower()}, about ₹{item['budgetMin']:,}–₹{item['budgetMax']:,})" for item in matches) + ". These are approximate local estimates; check current access and travel conditions."
    else:
        answer = "I can suggest Karnataka hills, beaches, waterfalls, heritage, wildlife, and short trips. Tell me your interests, days, or an approximate budget."
    return {"answer": answer, "source": "local-destination-catalogue", "approximate": True}


def record_list(kind: str, limit: int):
    with connect() as db:
        rows = db.execute("SELECT body FROM records WHERE kind = ? ORDER BY updated_at DESC LIMIT ?", (kind, limit)).fetchall()
    return {"items": [json.loads(row["body"]) for row in rows], "total": len(rows)}


def record_upsert(kind: str, record: Record):
    body = record.model_dump(exclude_none=True)
    identity = body.get("id") or str(uuid4())
    body["id"] = identity
    with connect() as db:
        db.execute("INSERT INTO records(kind,id,body,updated_at) VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(kind,id) DO UPDATE SET body=excluded.body,updated_at=CURRENT_TIMESTAMP", (kind, identity, json.dumps(body, ensure_ascii=False)))
    return body


def record_delete(kind: str, identity: str):
    with connect() as db:
        cursor = db.execute("DELETE FROM records WHERE kind=? AND id=?", (kind, identity))
    if cursor.rowcount == 0:
        raise HTTPException(404, f"{kind.title()} not found")
    return Response(status_code=204)


@app.get("/api/memories")
def list_memories(limit: int = Query(default=100, ge=1, le=500)):
    return record_list("memory", limit)


@app.post("/api/memories", status_code=201)
def create_memory(record: Record):
    return record_upsert("memory", record)


@app.put("/api/memories/{identity}")
def update_memory(identity: str, record: Record):
    return record_upsert("memory", record.model_copy(update={"id": identity}))


@app.delete("/api/memories/{identity}", status_code=204)
def delete_memory(identity: str):
    return record_delete("memory", identity)


@app.get("/api/trips")
def list_trips(limit: int = Query(default=100, ge=1, le=500)):
    return record_list("trip", limit)


@app.post("/api/trips", status_code=201)
def create_trip(record: Record):
    return record_upsert("trip", record)


@app.put("/api/trips/{identity}")
def update_trip(identity: str, record: Record):
    return record_upsert("trip", record.model_copy(update={"id": identity}))


@app.delete("/api/trips/{identity}", status_code=204)
def delete_trip(identity: str):
    return record_delete("trip", identity)
