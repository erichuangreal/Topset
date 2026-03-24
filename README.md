<ins>Open demo on MOBILE for optimal viewing experience.</ins>

**Live Demo:** https://topset.erichuangreal.dev/

A workout logging app that breaks from the standard number-crunching approach. Instead of raw metrics, Buffy focuses on an avatar coach that grows with the user's progress. Mood is derived from training consistency and volume. Feedback is deterministic, encouraging, and low-stakes.

Much of the algorithm is hidden behind the UI — only highlights, coaching tips, and avatar emotions are surfaced.

1. **Highlights** are chosen for the day and week to surface meaningful wins.
2. **Coaching tips** are unique to each set based on lift category, rep range, and fatigue state.
3. **Avatar mood** changes based on training volume and consistency over the past 14 days.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7, React Router 7, Tailwind CSS 4 |
| **Backend** | Java 21, Spring Boot 3.3, Spring Data JPA, Hibernate 6 |
| **Database** | MySQL 8 |
| **Migrations** | Flyway |
| **Validation** | Jakarta Bean Validation |
| **Ops** | Docker, Docker Compose, Nginx |

---

## Project Structure

```
Topset/
├── docker-compose.yml       Full stack (dev / local)
├── backend-java/            Spring Boot API (Java 21)
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
├── frontend/                React + Vite SPA
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
└── scripts/                 Deploy / firewall helpers
```

---

## Quick Start (Docker — recommended)

Requires [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/).

### 1. Clone the repo

```bash
git clone https://github.com/erichuangreal/Topset.git
cd Topset
```

### 2. Start all services

```bash
docker compose up -d --build
```

This starts three containers:

| Container | Description | Port |
|---|---|---|
| `topset-db` | MySQL 8 | `localhost:3406` |
| `topset-backend-java` | Spring Boot API | `localhost:8002` |
| `topset-frontend` | Nginx serving React SPA | `localhost:5273` |

Open **http://localhost:5273** in your browser.

> On first run, Flyway automatically creates all database tables. No manual migration step needed.

---

## Docker Commands

### Start everything (build images if needed)

```bash
docker compose up -d --build
```

### Start without rebuilding (faster if no code changes)

```bash
docker compose up -d
```

### Start individual services

```bash
docker compose up -d db                  # database only
docker compose up -d backend-java        # backend only (requires db)
docker compose up -d --build frontend    # frontend only (rebuilds Nginx image)
```

### View logs

```bash
docker compose logs -f backend-java      # follow backend logs
docker compose logs -f frontend          # follow frontend logs
docker compose logs -f                   # all services
```

### Stop all services

```bash
docker compose down
```

### Stop and remove all data (wipes the database volume)

```bash
docker compose down -v
```

### Rebuild a single service

```bash
docker compose up -d --build backend-java
docker compose up -d --build frontend
```

---

## Production Deployment

### 1. Set environment variables

Create a `backend-java/.env` file (or pass via your hosting platform):

```env
DB_HOST=your-mysql-host
DB_PORT=3306
DB_NAME=lifting
DB_USER=lifting_app
DB_PASS=your_secure_password
PORT=8002
```

### 2. Use a production Docker Compose override

Create `docker-compose.prod.yml`:

```yaml
services:
  db:
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_PASSWORD: ${MYSQL_PASSWORD}
    ports: []          # don't expose MySQL publicly

  backend-java:
    environment:
      DB_HOST: db
      DB_PASS: ${MYSQL_PASSWORD}
    restart: always

  frontend:
    restart: always
```

Run with:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 3. Health check

```bash
curl http://your-server:8002/health
# {"ok":true}
```

### Useful production commands

```bash
# Pull latest code and rebuild
git pull && docker compose up -d --build

# View backend logs in production
docker logs topset-backend-java -f --tail 100

# Restart backend without downtime
docker compose up -d --no-deps backend-java

# Backup the database
docker exec topset-db mysqldump -u root -prootpassword lifting > backup.sql

# Restore from backup
docker exec -i topset-db mysql -u root -prootpassword lifting < backup.sql
```

---

## Local Development (without Docker)

### Requirements

- Java 21 (e.g. [Eclipse Temurin](https://adoptium.net/))
- Maven 3.9+
- Node.js 20 LTS + pnpm
- MySQL 8 running locally

### Backend

```bash
cd backend-java

# Create backend-java/.env with your local DB credentials
cp .env.example .env   # edit as needed

# Run in dev mode (requires Maven)
mvn spring-boot:run
# API available at http://localhost:8002
```

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
# App available at http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:8002`.

---

## API Endpoints

All endpoints are prefixed with `/api/workouts`.

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/workouts` | Save a full workout (exercises + sets) |
| `POST` | `/api/workouts/rest` | Mark a rest day |
| `GET` | `/api/workouts?date=YYYY-MM-DD` | Get workouts for a specific day |
| `GET` | `/api/workouts/range?start=&end=` | Get workouts in a date range |
| `DELETE` | `/api/workouts/all` | Delete all workouts |

---

## Application Overview

Buffy is a low-stakes, encouraging environment for lifting. Rather than optimisation or competition, the app emphasises consistency, intent, and long-term habit formation.

All coaching output is **deterministic** — given the same workout data and history, the same feedback is always produced. No AI, no randomness.

### Pages

| Page | Description |
|---|---|
| **Home** | Avatar coach, mood state, recent highlights |
| **Log Workout** | Exercise selection, set logging (weight + reps), live coaching tips |
| **Calendar** | Visual training history, consistency view |
| **Stats** | Aggregated performance trends (unit-aware: kg / lb) |
| **Profile** | Units, experience level, data reset |

### Architecture Notes

- **Coaching logic runs entirely client-side** — no server round-trips for tips or highlights
- **Draft workouts** are persisted in `localStorage` with a daily reset (survive page refresh)
- **Profile/settings** are `localStorage`-only (no account system yet)
- **Backend** is pure persistence — REST API backed by MySQL via JPA

---

## Design Principles

- Habit-first, not ego-first
- Deterministic logic over randomness
- High signal, low noise UI
- Encouragement without aggressive gamification
- Coaching adapts to the user, not global standards

---

## Future Extensions

- Account-based cloud sync
- Machine-learning assisted coaching refinement
- Progressive overload recommendations
- Personalized fatigue modeling
- Optional social and competitive features
