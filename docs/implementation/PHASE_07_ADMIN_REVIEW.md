# Phase 07: Admin Review

## Objective

Allow trusted admins to review AI-generated incident summaries before publication.

## Admin Features

- View draft incidents
- See source list
- Compare extracted claims against sources
- Edit beginner TLDR
- Edit technical summary
- Update severity
- Update confidence
- Publish incident
- Archive incident

## Required Admin Warnings

Show warnings when:

- incident has fewer than 2 sources,
- affected versions are missing,
- package names are inferred,
- severity is AI-generated only,
- exploit status is unclear,
- CISA KEV status is unknown.

## Acceptance Criteria

- Admin can publish reviewed incidents.
- Published incidents show source-backed metadata.
- Critical alerts require reviewed status.