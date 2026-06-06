# VendorBridge Backend

Procurement & Vendor Management ERP System Backend

## Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Google OAuth
- Nodemailer

## Setup

1. Copy `.env.example` to `.env` and configure
2. Install dependencies: `npm install`
3. Run migrations: `npm run prisma:migrate`
4. Seed database: `npm run prisma:seed`
5. Start server: `npm start`

## Development

`npm run dev` - Start with nodemon

## API Prefix

All APIs are prefixed with `/api/v1`

## Health Check

`GET /health`
