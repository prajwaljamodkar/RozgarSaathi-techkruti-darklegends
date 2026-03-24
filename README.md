# RozgarSaathi — रोज़गार साथी

> Hyperlocal daily gig board for daily-wage workers — plumbers, electricians, painters, mazdoors.
> No middleman. No commission.

---

## Project structure

```
RozgarSaathi/
├── index.html          ← Frontend (plain HTML/CSS/JS)
└── backend/            ← Plain Java backend (no Spring)
    ├── pom.xml
    └── src/main/java/rozgarsaathi/
        ├── RozgarServer.java       ← Entry point (HttpServer)
        ├── model/
        │   ├── Worker.java
        │   └── Job.java
        ├── store/
        │   └── DataStore.java      ← In-memory store (swap for DB later)
        └── handler/
            ├── WorkerHandler.java  ← GET/POST /api/workers
            └── JobHandler.java     ← GET/POST /api/jobs
```

---

## Running the backend

**Prerequisites:** Java 17+ and Maven 3.6+

```bash
# 1. Build a fat jar
cd backend
mvn package -q

# 2. Start the server (default port 8080)
java -jar target/rozgar-backend.jar

# Optional: run on a different port
java -Dport=9090 -jar target/rozgar-backend.jar
```

You should see:
```
==============================================
  RozgarSaathi backend running on port 8080
  http://localhost:8080/api/workers
  http://localhost:8080/api/jobs
  http://localhost:8080/health
  Press Ctrl+C to stop.
==============================================
```

---

## Running the frontend

Open `index.html` directly in your browser **or** serve it with any static file server so the API calls reach `http://localhost:8080`:

```bash
# Python (any directory containing index.html)
python3 -m http.server 3000
# then open http://localhost:3000
```

---

## API reference

### Workers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/workers` | List all workers |
| `GET`  | `/api/workers?skill=plumber&pincode=411014&available=true` | Filter workers |
| `POST` | `/api/workers` | Register a new worker |

**POST body example:**
```json
{
  "name": "Mohan Yadav",
  "phone": "9876543210",
  "skill": "plumber",
  "pincode": "411014",
  "area": "Sion Naka, Mumbai",
  "availableToday": true,
  "ratePerDay": 700
}
```

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/jobs` | List all jobs |
| `GET`  | `/api/jobs?skill=plumber&pincode=411014&date=2026-03-24` | Filter jobs |
| `POST` | `/api/jobs` | Post a new job |

**POST body example:**
```json
{
  "title": "Bathroom tap leak repair",
  "skillRequired": "plumber",
  "pincode": "411014",
  "area": "Sion West, Mumbai",
  "workDate": "2026-03-24",
  "pay": "₹800",
  "description": "Kitchen and bathroom taps leaking. Need fix same day.",
  "posterName": "Mehta Family",
  "posterPhone": "9197000001"
}
```

### Health check

```
GET /health  →  {"status":"ok"}
```

---

## Data persistence

Data is stored **in-memory** for the MVP. The server pre-loads sample workers and jobs on start.

To migrate to a real database later:
1. Open `backend/src/main/java/rozgarsaathi/store/DataStore.java`
2. Replace the `CopyOnWriteArrayList` operations with JDBC / JPA calls
3. The handler classes need **no changes** — they only call `DataStore` methods

---

## Tech stack

- **Frontend:** Plain HTML + CSS + JavaScript (single file)
- **Backend:** Java 17 · `com.sun.net.httpserver.HttpServer` · `org.json`
- **No Spring**, no external framework, no database required to run
