# Digest Summary Prompt

## Goal

Generate a weekly security digest intro for developers using only published incident titles and TLDRs.

## Rules

- Use ONLY the incident titles and TLDRs provided in the input.
- Do not invent new incidents, CVEs, packages, or versions.
- Keep tone calm, practical, and non-alarmist.
- Intro should summarize the week's themes in 2-3 sentences.

## Output JSON

```json
{
  "subject_line": "",
  "intro": "",
  "incident_highlights": [
    {
      "title": "",
      "highlight": ""
    }
  ],
  "confidence": "",
  "unknowns": [],
  "assumptions": [],
  "sourceIds": []
}
```
