# Backend - Food Court POS System

Production Node.js + Express backend API server untuk Food Court POS System.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:setup

# 3. Development mode
npm run dev

# 4. Production mode
npm start
```

Backend akan run di `http://localhost:5000`

## Project Structure

```
src/
├── config/          Database & environment config
├── controllers/     HTTP request handlers
├── services/        Business logic layer
├── models/          Database models & schema
├── routes/          API routes definition
├── middleware/      Auth, error handling, validation
├── utils/           Helper functions & validators
├── socket/          Socket.io event handlers
└── index.js         Application entry point

migrations/         Database migration files
tests/              Unit & integration tests
```

## Available Scripts

```bash
npm run start        # Start production server
npm run dev          # Start with hot-reload (nodemon)
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Check code style
npm run lint:fix     # Auto-fix code style
npm run format       # Format code with Prettier
npm run migrate      # Run database migrations
npm run seed         # Seed sample data
npm run db:setup     # Migrate + Seed
```

## API Documentation

After server starts, visit:
- Swagger UI: `http://localhost:5000/api-docs`
- API Health: `http://localhost:5000/health`

## Database

PostgreSQL 12+

```bash
# Create database
createdb foodcourt_pos

# Reset database
npm run migrate:rollback
npm run migrate
npm run seed
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- services/OrderService.test.js

# Watch mode
npm run test:watch

# Coverage report
npm test -- --coverage
```

## Environment Variables

Copy `.env.example` ke `.env` dan setup sesuai kebutuhan:

```bash
cp .env.example .env
```

Key variables:
- `NODE_ENV` - development/production
- `PORT` - server port (default 5000)
- `DB_*` - database credentials
- `JWT_SECRET` - change in production!
- `API_URL` - frontend base URL

## Architecture

### API Layers

```
Router → Middleware → Controller → Service → Database
  ↓
Validation, Authentication, Error Handling
```

### Services

- **AuthService** - Login, token, PIN verification
- **OrderService** - Order CRUD, status management
- **PaymentService** - Payment processing
- **QRCodeService** - QR generation & validation
- **RevenueShareService** - Commission calculation
- **NotificationService** - Socket.io events
- **ReportService** - Analytics & reporting

## Real-time (Socket.io)

Socket server runs on port 5001 (separate from REST API)

Events:
- `order:paid` - Notify tenant when order paid
- `order:ready` - Notify customer when order ready
- `payment:confirmed` - Payment confirmation
- `display:update` - Update display monitors

## Error Handling

All endpoints return standardized responses:

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Error description"
  }
}
```

## Logging

Logs saved to `logs/app.log` dengan Winston logger

Levels: error, warn, info, debug

## Security

- JWT authentication
- bcrypt password/PIN hashing
- CORS configured
- Helmet security headers
- Input validation
- SQL injection prevention

## Deployment

### Docker

```bash
docker-compose up
```

See `docker-compose.yml` for configuration

### Cloud Deployment

- AWS Lambda / EC2
- DigitalOcean Droplet
- Heroku
- Railway

## Support

Issues & questions: `support@foodcourt-pos.com`
