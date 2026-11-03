# Remediation Prompt

## Goal

Generate a user-specific remediation plan based on scan findings.

## Input

- project dependencies,

- affected package,

- installed version,

- affected version range,

- patched version,

- advisory data,

- incident data,

- confidence,

- sources.

## Output JSON

```json

{

  "risk_summary": "",

  "priority": "",

  "actions": [

    {

      "title": "",

      "description": "",

      "command": "",

      "urgency": "",

      "requires_rotation": false,

      "requires_redeploy": false

    }

  ],

  "beginner_explanation": "",

  "technical_notes": "",

  "unknowns": [],

  "source_ids": []

}

Rules

* Do not recommend token rotation unless the incident suggests possible credential exposure or malicious install behavior.
* Do not recommend deleting lockfiles unless necessary.
* Provide commands only when safe and broadly applicable.
* Label manual review steps clearly.