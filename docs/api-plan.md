# API Plan

## Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

## Users and Keys

- `GET /api/users`
- `GET /api/users/:id/public-key`
- `POST /api/keys/generate`

## Submissions

- `POST /api/submissions`
- `GET /api/submissions`
- `GET /api/submissions/:id`
- `POST /api/submissions/:id/verify`
- `POST /api/submissions/:id/decrypt`

## Audit Logs

- `GET /api/audit-logs`
