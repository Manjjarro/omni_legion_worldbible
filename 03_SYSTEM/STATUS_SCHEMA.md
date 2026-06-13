---
id: STATUS_SCHEMA
type: system
version: "4.3.1"
status:
  runtime_state: current
last_updated: 2026-06-12
---

# Status Vocabulary (v4.3.1)

## Schema Model (Authoritative — supersedes PATCH_README v4.3 wording)

`status` is always a **nested object** in frontmatter. There are no top-level
`lifecycle_status` / `role_status` / `runtime_state` fields anywhere in the
vault. The v4.3 patch README described these as flat top-level fields; that
was a documentation error, not an instruction to migrate. The names below are
**sub-keys of `status`**, scoped by node `type`:

```yaml
status:
  lifecycle: ...        # shot, scene, episode, event
  review_state: ...     # shot only
  role: ...              # character only
  character_state: ...   # character only
  state_lifecycle: ...    # state nodes only
  runtime_state: ...      # system / review / engine docs only
```

A node must only contain the sub-keys legal for its `type` (see table below).
Validators must reject any `status` object containing a sub-key not legal for
that node's `type`, and must reject any value not in that sub-key's
controlled vocabulary.

## Legal sub-keys by type

| type      | legal `status` sub-keys                |
|-----------|------------------------------------------|
| shot      | `lifecycle`, `review_state`               |
| scene     | `lifecycle`                               |
| episode   | `lifecycle`                               |
| event     | `lifecycle`                               |
| state     | `state_lifecycle`                          |
| character | `role`, `character_state`                  |
| location  | `lifecycle`                                |
| system    | `runtime_state`                            |
| review    | `runtime_state`                            |

## `lifecycle` (shot, scene, episode, event, location)

- `Planned`
- `Draft`
- `Review`
- `Winner`
- `Complete`
- `Archived`

## `review_state` (shot only)

- `Pending`
- `Approved`
- `Rejected`
- `Needs Revision`

**Gate rule (machine-enforced):** `review_state: Approved` is only valid if
`status.lifecycle == "Winner"` AND `image_source` AND `video_source` are both
non-empty paths. A validator that finds `Approved` without those conditions
must raise a Critical error, not a warning.

## `role` (character only)

- `Core`
- `Antagonist`
- `Supporting`
- `Minor`

## `character_state` (character only)

Tracks a character's current narrative standing across the series. This is
distinct from `role` (which is a casting/structural label that rarely
changes) and was previously — incorrectly — conflated with `lifecycle` on
character nodes.

- `Active`
- `Wounded`
- `Captured`
- `Deceased`
- `Inactive`

## `state_lifecycle` (state nodes only)

Resolves the "which STATE node is current truth" ambiguity. Distinct from the
shot/scene `lifecycle` vocabulary above — a state node is never "Winner" or
"Draft", it is either the live snapshot or a retained history record.

- `Active` — the currently-authoritative snapshot. The compiler MUST read
  this node before generating any foreground layer for the associated
  character.
- `Archived` — a superseded snapshot, retained for continuity history /
  audit. Not read by the compiler.

**Invariant (machine-enforced):** for any given `character`, exactly one
state node may have `status.state_lifecycle: Active` at a time. When a new
state node is created for that character, the previous `Active` node must be
flipped to `Archived` in the same operation.

## `runtime_state` (system, review, engine/rule docs)

- `current`
- `deprecated`
- `legacy`

## `type` enum

- `shot`
- `scene`
- `episode`
- `event`
- `state`
- `character`
- `location`
- `system`
- `review` — ephemeral review-log document. Included in the audit trail and
  in propagation validation (per `REVIEW_TEMPLATER.md`), but excluded from
  canon-node completeness checks (it has no `continuity_score`,
  `image_source`, etc., and is not expected to).

## Migration note (v4.3 → v4.3.1)

This revision does not require renaming any existing `status:` block in
`SHOT_001`, `SHOT_002`, `DASHBOARD`, `PRODUCTION_GUIDE`, `SERIES_PIPELINE`, the
templates, or `REVIEW_TEMPLATER` — those already match the nested model above.
The only files that required correction were `CHAR_002_SERAPH.md` (lifecycle
removed from a character node, `character_state` introduced) and
`STATE_001_REN_POST_EP001.md` (`lifecycle: Active` renamed to
`state_lifecycle: Active`, which was already its intended meaning). See
`PATCH_ERRATA_v4.3.1.md` for the full diff list.
