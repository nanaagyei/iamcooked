# Context Retention and Anti-Auto-Compaction Workflow

Long-running AI-agent builds lose quality when context gets compressed. This project uses handoff files to preserve important decisions.

## Required Agent Behavior

Every agent must update these files after completing work:

1. `IMPLEMENTATION_STATUS.md`
2. `AGENT_HANDOFF.md`
3. Relevant phase file inside `docs/implementation/`
4. Any changed API/schema/design files

## Do Not Rely On Chat History

Agents must treat repository markdown files as source of truth.

## Required End-of-Task Update Format

After every implementation step, append:

```md
## Update: YYYY-MM-DD HH:mm

### Completed

- ...

### Files Changed

- ...

### Decisions Made

- ...

### Blockers

- ...

### Next Recommended Step

- ...

### Context Snapshot

Keep this section updated.

### Product

StackRadar is a personalized security intelligence platform for AI-assisted builders.

### Core Workflow

Upload lockfile → scan dependencies → match advisories/incidents → explain risk → provide action plan → subscribe for alerts.

### MVP Ecosystem

JavaScript/TypeScript only.

### Supported Lockfiles

* package-lock.json
* pnpm-lock.yaml
* yarn.lock

### Must-Have Sources

* OSV
* GitHub Advisory Database
* CISA KEV
* Curated vendor/security articles

### UI Direction

Professional, technical, dark-first, calm, precise, responsive.

### Critical Rule
This file is very important. It prevents the exact problem you mentioned: agents wandering off, forgetting the strategy, or compacting the context into nonsense.

---