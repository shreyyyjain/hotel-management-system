# Run Backend + Postgres with Docker Compose

## Prerequisites
- Docker Desktop
- PowerShell

## Start services
```powershell
cd "c:\Users\shrey\Desktop\Projects\Java\Hotel Management System"
docker compose up --build -d
```

## View logs
```powershell
docker compose logs -f backend
```

## Stop services
```powershell
docker compose down
```

## Environment variables
- `JWT_SECRET`: set a 32+ char secret (compose default is dev-only)
- `CORS_ALLOWED_ORIGINS`: comma-separated frontend origins (e.g., `http://localhost:5173`)

## Health
- Postgres healthcheck ensures backend starts after DB is ready.

