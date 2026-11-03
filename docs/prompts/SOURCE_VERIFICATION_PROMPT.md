# Source Verification Prompt

## Goal

Verify security incident claims against provided source excerpts.

## Rules

- Mark claims as verified only when directly supported by source text.
- Mark claims as disputed when sources contradict each other.
- Mark claims as unsupported when they cannot be found in any source.
- Do not invent new claims.

## Output JSON

```json
{
  "verified_claims": [],
  "disputed_claims": [],
  "unsupported_claims": [],
  "summary": "",
  "recommended_actions": [],
  "confidence": "",
  "unknowns": [],
  "assumptions": [],
  "sourceIds": []
}
```
