# 🐳 Docker Deployment Guide

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop/))
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start All Services

```powershell
# From the project root directory
docker-compose up -d
```

This will:
- Pull PostgreSQL 15 Alpine image
- Build the Spring Boot backend image
- Start PostgreSQL container
- Start backend container (waits for DB to be healthy)
- Initialize database with sample data (21 rooms, 16 food items, admin user)

### 2. Verify Services

```powershell
# Check running containers
docker-compose ps

# View backend logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres
```

### 3. Access the Application

- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html
- **Database**: localhost:5432 (hotel_management)

### 4. Test API Endpoints

```powershell
# Health check
curl http://localhost:8080/actuator/health

# Get all rooms
curl http://localhost:8080/api/rooms

# Login as admin
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@hotel.com\",\"password\":\"admin\"}'
```

## Managing Services

### Stop Services (Keep Data)

```powershell
docker-compose stop
```

### Restart Services

```powershell
docker-compose restart
```

### Stop & Remove Containers (Keep Data)

```powershell
docker-compose down
```

### Complete Cleanup (Remove Data)

```powershell
# WARNING: This deletes the database!
docker-compose down -v
```

## Database Access

### Using Docker Exec

```powershell
# Connect to PostgreSQL CLI
docker exec -it hotel-postgres psql -U postgres -d hotel_management

# Run SQL queries
\dt                           # List tables
SELECT * FROM room;           # View rooms
SELECT * FROM food_item;      # View food items
\q                            # Quit
```

### Using External Tool (DBeaver, pgAdmin)

- **Host**: localhost
- **Port**: 5432
- **Database**: hotel_management
- **Username**: postgres
- **Password**: postgres

## Rebuilding After Code Changes

```powershell
# Rebuild backend image
docker-compose build backend

# Restart with new image
docker-compose up -d backend
```

## Environment Variables

Create `.env` file in project root (copy from `.env.example`):

```env
JWT_SECRET=your-secret-key-change-this-in-production-min-32-chars
```

## Troubleshooting

### Backend Won't Start

```powershell
# Check backend logs
docker-compose logs backend

# Common issue: Database not ready
# Solution: Wait 10-20 seconds for postgres health check
```

### Port Already in Use

```powershell
# Check what's using port 8080
netstat -ano | findstr :8080

# Change port in docker-compose.yml:
# ports:
#   - "8081:8080"  # Maps external 8081 to container 8080
```

### Database Connection Failed

```powershell
# Check postgres health
docker-compose ps postgres

# Restart postgres
docker-compose restart postgres
```

### Reset Everything

```powershell
# Nuclear option - fresh start
docker-compose down -v
docker-compose up -d --build
```

## Production Deployment

### Security Checklist

- [ ] Change JWT_SECRET to random 64+ character string
- [ ] Change database password
- [ ] Enable HTTPS
- [ ] Update CORS_ALLOWED_ORIGINS to your domain
- [ ] Set spring.jpa.hibernate.ddl-auto to `validate` (not `update`)
- [ ] Add rate limiting
- [ ] Configure proper logging
- [ ] Set up database backups

### Example Production docker-compose.yml

```yaml
services:
  backend:
    environment:
      SPRING_PROFILES_ACTIVE: production
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      SPRING_JPA_HIBERNATE_DDL_AUTO: validate
      JWT_SECRET: ${JWT_SECRET}
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1024M
        reservations:
          cpus: '0.5'
          memory: 512M
```

## Default Credentials

**Admin User:**
- Email: admin@hotel.com
- Password: admin

⚠️ **Change this password immediately in production!**
