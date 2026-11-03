
# API Specification

## API Principles

- Use typed request/response schemas.
- Validate all input with zod.
- Never trust uploaded files.
- Return structured errors.
- Keep public APIs read-only unless authenticated.
- Rate-limit scan endpoints.

## Endpoints

### `GET /api/incidents`

Returns published incidents.

Query params:

```ts
{
  severity?: string;
  ecosystem?: string;
  type?: string;
  package?: string;
  q?: string;
  page?: number;
  limit?: number;
}
```
### `GET /api/incidents/:slug`
Returns a single incident.

### `POST /api/scan/upload`

Uploads and scans a lockfile.

Request:
```ts
FormData {
  file: File;
}
```

Response:
```ts
{
  scanReportId: string;
  riskLevel: string;
  riskScore: number;
  findingCount: number;
}
```

GET /api/scan/report/:id

Returns a scan report.

POST /api/newsletter/subscribe

Subscribes a user to digest.

Request:
{
  email: string;
  interests: string[];
  frequency: "DAILY" | "WEEKLY" | "CRITICAL_ONLY";
}

POST /api/admin/incidents

Creates draft incident.

Admin only.

PATCH /api/admin/incidents/:id

Updates incident.

Admin only.

POST /api/admin/incidents/:id/publish

Publishes reviewed incident.

Admin only.

Error Shape
{
  error: {
    code: string;
    message: string;
    details?: unknown;
  }
}

