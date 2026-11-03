# 10. `AI_PIPELINE.md`

```md

# AI Pipeline Specification

## Goal

Use AI to translate security information into structured, readable, source-backed explanations.

## Non-Negotiable Rule

AI must not be the source of truth.

The source of truth is structured data from advisories, incidents, and trusted sources.

AI may:

- summarize,

- simplify,

- classify,

- extract structured fields,

- generate action plans,

- explain concepts.

AI may not:

- invent affected versions,

- invent package names,

- invent exploit status,

- invent remediation steps,

- claim a user is affected without dependency evidence.

## AI Output Types

### 1. Incident Extraction

Input:

- raw source title,

- source excerpt/body,

- URL,

- published date,

- source type.

Output:

```json

{

  "title": "",

  "incident_type": "",

  "ecosystem": "",

  "affected_packages": [],

  "affected_versions": [],

  "attack_vector": "",

  "impact": "",

  "recommended_actions": [],

  "confidence": "",

  "severity": "",

  "unknowns": [],

  "source_claims": []

}
2. Beginner TLDR

Should explain:

* what happened,
* why it matters,
* who may be affected,
* what to do.

Tone:

* calm,
* clear,
* non-alarmist,
* no jargon unless explained.

3. Technical Summary

Should include:

* package names,
* version ranges,
* attack vector,
* exploitability,
* indicators of compromise if available,
* remediation,
* references.

4. Personalized Remediation

Input:

* scan findings,
* user package versions,
* advisory records,
* incident records.

Output:

* prioritized action plan,
* commands,
* explanation,
* severity,
* confidence.

Required Confidence Labels

Every AI-generated record must include one of:

* Confirmed
* Likely
* Developing
* Unverified
* Disputed

Review Flow

High-severity public incident pages must go through admin review before publishing.

Critical alerts must not be sent directly from unreviewed AI output.