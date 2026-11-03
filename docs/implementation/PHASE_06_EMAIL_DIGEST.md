# Phase 06: Email Digest

## Objective

Create a retention loop through weekly and critical security updates.

## Digest Types

### Weekly Builder Brief

Includes:

- top incidents,
- npm ecosystem summary,
- beginner lesson,
- recommended action,
- link to scan project.

### Critical Alert

Only sent when:

- severity is Critical or High,
- confidence is Confirmed or Likely,
- affected package matches user's watched packages or scanned dependencies.

## Email Sections

1. Subject line
2. One-line summary
3. Top 3 incidents
4. "Does this affect me?" CTA
5. Learning section
6. Footer and unsubscribe

## Acceptance Criteria

- Users can subscribe.
- Emails respect interests.
- Digest content is concise.
- Critical alerts are not sent from unreviewed AI output.