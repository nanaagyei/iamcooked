# Phase 04: AI Summary Pipeline

## Objective

Generate structured, source-backed explanations for incidents and scan findings.

## Required Prompts

- [x] Incident extraction
- [x] Beginner TLDR
- [x] Technical summary
- [x] Remediation plan
- [x] Source verification
- [x] Newsletter digest

## Output Validation

All AI output is parsed with Zod via AI SDK `Output.object()`.

Invalid output is rejected. Claim verifier cross-checks CVEs, GHSAs, packages, and versions against source context.

## Required Fields

Each generated explanation includes:

- summary (where applicable),
- confidence,
- assumptions,
- unknowns,
- source references,
- recommended actions (where applicable).

## Acceptance Criteria

- [x] AI output is structured JSON.
- [x] No freeform unvalidated storage.
- [x] Admin can review/edit generated summaries via preview modal.
- [x] User-facing explanations are source-backed.
- [x] AiGeneration audit log persists all generations.
- [x] On-demand scan remediation cached in ScanReport.remediationPlan.
- [x] Copilot hardened with message filters and token-gated scan context.

## Implementation Notes

- `@iamcooked/ai` uses AI SDK v7 with shared `generateStructured()` and `verifyClaims()`.
- Admin workflows: `/api/ai/generate` (5 types).
- User workflow: `/api/ai/remediation` (on-demand, token-gated).
- Publish gate blocks CRITICAL/HIGH incidents with UNVERIFIED confidence.
