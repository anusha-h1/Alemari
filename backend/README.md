# ALEMARI API

FastAPI backend for the Karnataka destination catalogue, approximate itinerary generation, local travel assistant, and persistent trip/memory metadata.

## Start on Windows

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The interactive API reference is at `http://127.0.0.1:8000/docs`. SQLite data is saved in `backend\alemari.sqlite3`; set `ALEMARI_DB_PATH` to choose another location. Configure `ALEMARI_CORS_ORIGINS` as a comma-separated origin list for deployment. The API has no authentication and is intended for local development; do not expose it to untrusted networks without adding authentication and per-user data isolation.

Routes: `GET /api/health`, `GET /api/destinations`, `GET /api/destinations/{id}`, `POST /api/itinerary`, `POST /api/assistant/chat`, and CRUD on `/api/memories` and `/api/trips`. Costs are approximate. No booking provider or AI model is connected. Uploaded photos, personal stories, and preferences remain in the browser's IndexedDB/localStorage; the frontend does not upload journal content to this unauthenticated API.
