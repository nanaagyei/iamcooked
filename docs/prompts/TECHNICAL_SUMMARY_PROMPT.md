# Technical Summary Prompt

## Goal

Generate a technical summary of a security incident with package names, version ranges, attack vector, exploitability, indicators of compromise, remediation steps, and references.

## Rules

- Never invent affected versions. Only include versions from the source.
- Never invent package names.
- Do not claim a user is affected without dependency evidence.
- Prefer DEVELOPING when information is still emerging.
- Prefer UNVERIFIED when the only source is social/community content.

## Output JSON

```json
{
  "summary": "",
  "cves": [],
  "affectedVersions": [],
  "patchedVersions": [],
  "attackVector": "",
  "exploitability": "",
  "indicatorsOfCompromise": [],
  "confidence": "",
  "unknowns": [],
  "assumptions": [],
  "sourceIds": [],
  "claims": []
}
```
