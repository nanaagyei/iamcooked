# Phase 03: Lockfile Scanner

## Objective

Allow users to upload JavaScript lockfiles and receive a dependency risk report.

## Supported Files

- package-lock.json
- pnpm-lock.yaml
- yarn.lock

## Tasks

### 1. Upload UI

Create `/scan`.

Requirements:

- drag and drop,
- file picker,
- supported file list,
- privacy note,
- max file size,
- loading state.

### 2. File Validation

Reject:

- unsupported extensions,
- files above max size,
- invalid JSON/YAML,
- empty files.

### 3. Dependency Parsing

Return normalized dependency list.

### 4. OSV Batch Query

Use package name/version to query vulnerabilities.

OSV supports batched vulnerability queries, which makes it suitable for checking many package versions from a lockfile.

### 5. Incident Matching

Compare parsed package names against local `IncidentPackage` records.

### 6. Risk Report

Generate report with:

- risk score,
- risk level,
- findings,
- action plan,
- affected packages,
- sources.

## Acceptance Criteria

- User can upload a package-lock file.
- Parser extracts dependencies correctly.
- OSV findings appear in report.
- Report page is beginner-friendly.
- User can subscribe after scan.