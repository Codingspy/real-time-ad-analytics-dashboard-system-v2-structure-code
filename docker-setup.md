# Docker Setup Guide for Ad Analytics Dashboard

This guide will help you run MongoDB, Redis, and Elasticsearch using Docker for the Ad Analytics Dashboard.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed
- Node.js 18+ installed

## Quick Start

### 1. Start the Services

```bash
# Start all services (MongoDB, Redis, Elasticsearch, Kibana)
docker-compose up -d

# Check if all services are running
docker-compose ps
```

### 2. Verify Services

```bash
# Check MongoDB
docker logs ad-analytics-mongodb

# Check Redis
docker logs ad-analytics-redis

# Check Elasticsearch
docker logs ad-analytics-elasticsearch

# Check Kibana
docker logs ad-analytics-kibana
```

### 3. Access Services

- **MongoDB**: `mongodb://localhost:27017`
- **Redis**: `redis://localhost:6379`
- **Elasticsearch**: `http://localhost:9200`
- **Kibana**: `http://localhost:5601`

## Service Details

### MongoDB
- **Port**: 27017
- **Database**: ad-analytics
- **Username**: adanalytics
- **Password**: adanalytics123
- **Root Username**: admin
- **Root Password**: password123

### Redis
- **Port**: 6379
- **Password**: redis123
- **Persistence**: Enabled (AOF)

### Elasticsearch
- **Port**: 9200 (HTTP), 9300 (Transport)
- **Username**: elastic
- **Password**: elastic123
- **Security**: Disabled for development
- **Memory**: 512MB allocated

### Kibana
- **Port**: 5601
- **Purpose**: Visualize Elasticsearch data
- **Access**: http://localhost:5601

## Backend Setup

### 1. Configure Environment

```bash
cd backend
copy env.example .env
```

The `.env` file is already configured for Docker services.

### 2. Install Dependencies

```bash
npm install
```

### 3. Seed Database

```bash
npm run seed
```

### 4. Start Backend

```bash
npm run dev
```

## Frontend Setup

### 1. Install Dependencies

```bash
# From project root
npm install
```

### 2. Start Frontend

```bash
npm run dev
```

## Complete Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Kibana**: http://localhost:5601
- **Elasticsearch**: http://localhost:9200

## Docker Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs mongodb
docker-compose logs redis
docker-compose logs elasticsearch
docker-compose logs kibana
```

### Restart Services
```bash
docker-compose restart
```

### Remove Everything (including data)
```bash
docker-compose down -v
```

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker exec -it ad-analytics-mongodb mongosh --username admin --password password123

# Test connection
docker exec -it ad-analytics-mongodb mongosh --username adanalytics --password adanalytics123 --authenticationDatabase ad-analytics
```

### Redis Connection Issues
```bash
# Test Redis connection
docker exec -it ad-analytics-redis redis-cli -a redis123 ping
```

### Elasticsearch Connection Issues
```bash
# Check Elasticsearch health
curl -u elastic:elastic123 http://localhost:9200/_cluster/health

# Check if Elasticsearch is ready
curl -u elastic:elastic123 http://localhost:9200/_cat/indices
```

### Memory Issues
If you encounter memory issues with Elasticsearch:

1. Increase Docker memory allocation in Docker Desktop
2. Or modify the ES_JAVA_OPTS in docker-compose.yml:
   ```yaml
   environment:
     - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
   ```

## Development Workflow

1. **Start services**: `docker-compose up -d`
2. **Start backend**: `cd backend && npm run dev`
3. **Start frontend**: `npm run dev` (from project root)
4. **Access application**: http://localhost:3000

## Production Considerations

For production deployment:

1. Change all default passwords
2. Enable Elasticsearch security
3. Use proper SSL certificates
4. Configure proper backup strategies
5. Use external volumes for data persistence
6. Set up monitoring and logging
