# Ad Analytics Backend API

A comprehensive Node.js/Express backend for real-time ad analytics dashboard with MongoDB, Elasticsearch, Redis, and Socket.IO integration.

## 🚀 Features

- **Real-time Analytics**: Live event tracking and dashboard updates
- **Multi-platform Support**: Google Ads, Facebook, Instagram, LinkedIn, Twitter, TikTok
- **Advanced Authentication**: JWT tokens, role-based access control, API keys
- **Event Processing**: Click, impression, conversion tracking with enrichment
- **Reporting**: Comprehensive performance reports with CSV export
- **Caching**: Redis-based caching for improved performance
- **Logging**: Structured logging with Elasticsearch integration
- **Rate Limiting**: API rate limiting and security features
- **Email Integration**: Password reset, email verification
- **Real-time Updates**: Socket.IO for live dashboard updates

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Search**: Elasticsearch for analytics and logging
- **Cache**: Redis for session management and caching
- **Real-time**: Socket.IO for live updates
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Express-validator
- **Logging**: Winston with Elasticsearch transport
- **Email**: Nodemailer
- **Security**: Helmet, CORS, rate limiting

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 6+
- Redis 6+
- Elasticsearch 8+
- npm or pnpm

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the environment template and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ad-analytics

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Elasticsearch Configuration
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=changeme

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 3. Start Services

Make sure you have the following services running:

```bash
# MongoDB
mongod

# Redis
redis-server

# Elasticsearch
elasticsearch
```

### 4. Seed Database

Populate the database with sample data:

```bash
npm run seed
```

This creates:
- 4 sample users (admin, manager, analyst, viewer)
- 4 sample campaigns with realistic data
- 30 days of sample events

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "analyst"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

### Campaigns

#### Get All Campaigns
```http
GET /api/v1/campaigns?status=active&platform=google&page=1&limit=20
Authorization: Bearer <token>
```

#### Create Campaign
```http
POST /api/v1/campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Campaign",
  "description": "Campaign description",
  "platform": "google",
  "type": "search",
  "budget": {
    "total": 5000,
    "daily": 500,
    "currency": "USD"
  },
  "schedule": {
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-12-31T23:59:59.999Z"
  }
}
```

#### Get Campaign Performance
```http
GET /api/v1/campaigns/:id/performance?timeRange=24h
Authorization: Bearer <token>
```

### Analytics

#### Get Overview Analytics
```http
GET /api/v1/analytics/overview?timeRange=24h&campaignId=123
Authorization: Bearer <token>
```

#### Get Hourly Data
```http
GET /api/v1/analytics/hourly?timeRange=24h
Authorization: Bearer <token>
```

#### Get Device Breakdown
```http
GET /api/v1/analytics/devices?timeRange=24h
Authorization: Bearer <token>
```

#### Get Geographic Data
```http
GET /api/v1/analytics/geographic?timeRange=24h
Authorization: Bearer <token>
```

### Events

#### Track Single Event
```http
POST /api/v1/events/track
Content-Type: application/json

{
  "eventType": "click",
  "campaignId": "507f1f77bcf86cd799439011",
  "value": 1.50,
  "platform": "google",
  "device": "desktop"
}
```

#### Track Bulk Events
```http
POST /api/v1/events/bulk
Content-Type: application/json

{
  "events": [
    {
      "eventType": "impression",
      "campaignId": "507f1f77bcf86cd799439011"
    },
    {
      "eventType": "click",
      "campaignId": "507f1f77bcf86cd799439011",
      "value": 1.50
    }
  ]
}
```

#### Get Recent Events
```http
GET /api/v1/events/recent/:campaignId?limit=50
```

### Reports

#### Generate Performance Report
```http
GET /api/v1/reports/performance?startDate=2024-01-01&endDate=2024-01-31&format=json
Authorization: Bearer <token>
```

#### Generate Campaign Report
```http
GET /api/v1/reports/campaign/:id?startDate=2024-01-01&endDate=2024-01-31&format=csv
Authorization: Bearer <token>
```

## 🔐 Authentication & Authorization

### User Roles

- **admin**: Full access to all features
- **manager**: Can create/edit campaigns, view all data
- **analyst**: Can view analytics and reports
- **viewer**: Read-only access to assigned campaigns

### API Keys

For server-to-server communication, use API keys:

```http
X-API-Key: your-api-key-here
```

## 📊 Real-time Features

### Socket.IO Events

Connect to Socket.IO for real-time updates:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join user room
socket.emit('join-user', userId);

// Join campaign room
socket.emit('join-campaign', campaignId);

// Listen for real-time events
socket.on('event', (data) => {
  console.log('New event:', data);
});
```

### Event Types

- `impression`: Ad impression
- `click`: Ad click
- `conversion`: Goal conversion
- `view`: Page view
- `scroll`: Scroll event
- `hover`: Hover event
- `form_submit`: Form submission
- `purchase`: Purchase event

## 🗄 Database Schema

### Users
- Authentication and profile information
- Role-based permissions
- API keys for server integration

### Campaigns
- Campaign configuration and targeting
- Budget and scheduling
- Performance metrics
- Notes and assignments

### Events
- Real-time event tracking
- Enriched with device, location, and technical data
- Indexed in Elasticsearch for analytics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ad-analytics` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `ELASTICSEARCH_NODE` | Elasticsearch URL | `http://localhost:9200` |
| `JWT_SECRET` | JWT signing secret | Required |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:3000` |

### Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production MongoDB, Redis, and Elasticsearch
3. Set secure JWT secrets
4. Configure email settings
5. Set up SSL/TLS certificates
6. Configure reverse proxy (nginx)

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## 📈 Monitoring & Logging

### Log Levels

- `error`: Application errors
- `warn`: Warning messages
- `info`: General information
- `http`: HTTP requests
- `debug`: Debug information

### Elasticsearch Integration

Logs are automatically sent to Elasticsearch for:
- Centralized log management
- Log analysis and monitoring
- Performance metrics
- Business event tracking

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection
- XSS protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run seed         # Seed database with sample data

# Production
npm start            # Start production server
npm run build        # Build for production

# Testing
npm test             # Run tests
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the logs for debugging

## 🔄 Updates

Stay updated with the latest changes:
- Follow the repository
- Check the changelog
- Review release notes

---

**Note**: This backend is designed to work with the Ad Analytics Dashboard frontend. Make sure to configure the CORS origin to match your frontend URL.
