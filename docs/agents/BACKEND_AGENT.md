# Backend Agent Instructions

## Mission

Build the API, database, scanning, and source ingestion backend for iamcooked.

## Stack

- Node.js
- TypeScript
- PostgreSQL
- Prisma
- zod
- server actions or route handlers
- worker jobs

## Priorities

1. Correct data modeling
2. Safe file handling
3. Reliable vulnerability matching
4. Structured API responses
5. Clear error handling
6. Rate limiting

## Required Backend Features

- Incident API
- Scan upload API
- Lockfile parsing
- OSV integration
- Advisory persistence
- Finding generation
- Newsletter subscription API
- Admin incident review API

## Security Requirements

- validate all inputs,
- reject oversized files,
- do not execute uploaded files,
- sanitize stored text,
- rate-limit scan endpoint,
- store minimal user data,
- do not leak uploaded file contents publicly.

## Completion Checklist

- all API inputs validated,
- all errors structured,
- all database writes type-safe,
- tests added for parsers,
- implementation status updated.