---
type: system
id: DASHBOARD
version: "4.3.1"
status:
  runtime_state: current
last_updated: 2026-06-12
---

Hybrid mode: Obsidian for canon, Cursor for runtime compilation.

## Production Status

```dataview
TABLE status.lifecycle AS "Status", status.review_state AS "Review", continuity_score AS "Continuity", last_updated AS "Updated"
FROM "01_NODES/shots"
WHERE type = "shot"
SORT last_updated DESC
```

## Character State

```dataview
TABLE status.role AS "Role", status.character_state AS "State", last_updated AS "Updated"
FROM "01_NODES/characters"
WHERE type = "character"
```

## Continuity / Story State

```dataview
TABLE mental_state AS "Mental State", stability AS "Stability", continuity_score AS "Continuity", status.state_lifecycle AS "State Lifecycle", delta_applied AS "Propagated"
FROM "01_NODES/state"
WHERE type = "state"
```

## Validator Health

Run order: validate_vault.py → health_check.js → verify_manifest.js
All three must pass before any EP_002 shot compile begins.

## Changelog (v4.3 → v4.3.1)

- Added `status.review_state` column to Production Status. This field
  existed in live shot data and templates but was previously not surfaced
  on the dashboard and not defined in the schema — both gaps closed in
  `STATUS_SCHEMA.md` v4.3.1.
- Character State table now reads `status.role` and `status.character_state`
  (both now schema-defined) instead of an undefined `status.lifecycle` on
  character nodes.
- Continuity / Story State table (was "Character State") now reads
  `status.state_lifecycle` and `continuity_score`, both newly defined for
  state nodes in v4.3.1.
- No query in this file depends on the flat `lifecycle_status` /
  `role_status` / `runtime_state` top-level fields described in the original
  PATCH_README — those names were a documentation error and were never the
  actual schema. Nested `status.*` paths remain canonical.
