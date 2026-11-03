# QA Agent Instructions

## Mission

Verify the correctness, usability, accessibility, and trustworthiness of iamcooked.

## Test Areas

### Functional

- incident feed loads,

- filters work,

- incident detail pages render,

- lockfile upload works,

- invalid files are rejected,

- scan report is generated,

- newsletter subscription works.

### Scanner

Test with:

- valid package-lock.json,

- valid pnpm-lock.yaml,

- invalid JSON,

- empty file,

- unsupported file,

- large file,

- package with known OSV vulnerability,

- package with no vulnerabilities.

### UI

Verify:

- mobile responsiveness,

- dark/light mode,

- keyboard navigation,

- focus states,

- accessible labels,

- color contrast,

- loading states,

- empty states.

### Trust

Verify:

- every incident has sources,

- confidence labels are visible,

- unverified incidents are not presented as confirmed,

- critical alerts require review.

## Completion Checklist

- QA report added,

- bugs filed,

- implementation status updated.