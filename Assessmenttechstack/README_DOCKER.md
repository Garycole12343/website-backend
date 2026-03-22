# Docker Setup for SkillSwap

This project is now Dockerized with three services:
1. Frontend: React + Vite served via Nginx on port 80.
2. Backend: Flask + Socket.IO on port 5000.
3. Database: MongoDB on port 27017.

## Prerequisites
- Docker
- Docker Compose

## Quick Start
To build and start all containers, run:
```bash
docker-compose up --build
```

The application will be available at [http://localhost](http://localhost).
The backend API will be available at [http://localhost:5000](http://localhost:5000).

## Environment Variables
The environment variables are pre-configured in `docker-compose.yml` for local development.

- MongoDB: `MONGO_URI=mongodb://mongodb:27017/skillswap`
- Backend CORS: `VITE_ORIGIN=http://localhost`
- Frontend API: `VITE_API_URL=http://localhost:5000/api`

## Data Persistence
MongoDB data is persisted in a Docker volume named `mongodb_data`.
Backend profile picture uploads are persisted in `./backend/uploads`.

## Stopping the app
To stop the application, run:
```bash
docker-compose down
```
To stop and remove volumes (warning: this will delete your data):
```bash
docker-compose down -v
```
