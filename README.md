# YUCA Server

Express + MongoDB + Gmail mailer for nomination submissions.

## Setup

1. Copy `.env.example` to `.env`
2. Fill `MONGODB_URI`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `ADMIN_EMAIL`
3. Run `npm install`
4. Start with `npm run dev`

## API

- `POST /api/nomination`
- `GET /health`
