# AI Agent Instructions

## Mission

Build source-backed AI workflows for incident extraction, explanation, remediation, and digest generation.

## Core Rule

AI must not invent facts.

Every factual claim must be traceable to:

- advisory data,
- source article,
- vendor advisory,
- maintainer statement,
- OSV record,
- GitHub advisory,
- CISA KEV record.

## Required Workflows

1. Extract structured incident from sources.
2. Generate beginner TLDR.
3. Generate technical summary.
4. Generate remediation checklist.
5. Generate newsletter digest.
6. Verify claims against source excerpts.

## Output Format

All outputs must be JSON.

No markdown-only generated output should be stored as the canonical record.

## Required Fields

Every AI result must include:

```json
{
  "confidence": "",
  "summary": "",
  "claims": [],
  "unknowns": [],
  "assumptions": [],
  "source_ids": [],
  "recommended_actions": []
}
```

Failure Behavior

If sources are insufficient:

* mark as UNVERIFIED,
* do not publish,
* ask for admin review,
* do not generate critical alert.

Completion Checklist

* prompts stored in /docs/prompts
* zod schemas added
* invalid outputs rejected
* tests added for prompt contracts
* implementation status updated