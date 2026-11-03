# Phase 08: Security Hardening

## Objective

Harden iamcooked for production hosting with authentication gates, rate limiting, input validation, and safe AI output handling.

## Implemented

### Scan security

- Token-gated anonymous scan reports (`ScanReport.accessToken`)
- Rate limiting on `/api/scan/upload` (Upstash Redis in production, in-memory fallback locally)
- File size and type validation on upload

### AI security

- Zod-validated structured output for all AI workflows
- Claim verifier cross-checks packages, versions, and CVEs
- `AiGeneration` audit log for admin workflows
- Copilot message sanitization and token requirement for scan context
- Publish gate: CRITICAL/HIGH incidents cannot publish with UNVERIFIED confidence

### API security

- Admin routes require `ADMIN_EMAILS` allowlist
- Cron digest requires `CRON_SECRET` bearer token
- Consistent `apiError` response shape

### Auth

- NextAuth v5 with GitHub provider
- Middleware protects `/admin`, `/dashboard/*`, `/settings`, `/api/admin/*`

## Acceptance Criteria

- [x] Scan reports are not publicly enumerable without token or session
- [x] Rate limits protect upload and copilot endpoints
- [x] AI output is validated before persistence
- [x] Critical incidents require reviewed confidence before publish
- [x] Environment secrets documented in `.env.example`

## Deployment checklist

- Set `CRON_SECRET`, `NEXTAUTH_SECRET`, `ADMIN_EMAILS` on Vercel
- Configure Upstash Redis for production rate limiting
- Verify Resend domain for digest emails
- Run `pnpm --filter @iamcooked/db db:migrate` against production database
