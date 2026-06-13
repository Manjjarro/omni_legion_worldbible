---
id: PATCH_V4_3_1_ERRATA
type: system
version: "4.3.1"
status:
  runtime_state: current
date: 2026-06-12
---

# Grimverse Studio OS — v4.3.1 Errata & Apply Instructions

## What v4.3 Got Right

- `image_source` / `video_source` populated on SHOT_001/002
- `STATE_001.scarring_log` completed (2 entries)
- `CHAR_002` identity anchor + pronoun lock formalized
- Frontmatter-at-line-1 fixed across DASHBOARD / PRODUCTION_GUIDE /
  SERIES_PIPELINE
- Art Direction Constant baked into `NEW_SHOT_TEMPLATER` + both winner shots
- Failure-override checklist pattern introduced on SHOT_001/002

All of the above is unchanged and does not need to be reapplied.

## What v4.3 Got Wrong (corrected in v4.3.1)

1. **PATCH_README claimed `status` was split into top-level
   `lifecycle_status` / `role_status` / `runtime_state` fields.** This never
   happened in any actual file — every live node, template, and the
   dashboard query already used (and still use) a nested `status:` object.
   v4.3.1 declares the nested object the **authoritative, documented**
   model and removes the flat-field claim entirely. No file needs to change
   shape because of this point — it is a documentation correction only.

2. **`CHAR_002_SERAPH.md` had `status.lifecycle: Active`.** `lifecycle` is
   scoped to shot/scene/episode/event/location, not character, and `Active`
   was not in that vocabulary anyway. Fixed: `status.lifecycle` removed from
   CHAR_002; `status.character_state: Active` added (new, schema-defined
   field for character narrative standing, separate from `status.role`).

3. **`STATE_001_REN_POST_EP001.md` had `status.lifecycle: Active`.** Same
   root issue — state nodes never used the shot/scene lifecycle vocabulary.
   Fixed: renamed to `status.state_lifecycle: Active`, a new vocabulary
   (`Active` / `Archived`) scoped to state nodes, with an invariant that
   exactly one state node per character is `Active` at a time.

4. **`review_state` (`Pending` / `Approved` on shots and in
   `NEW_SHOT_TEMPLATER`) was used but never defined in `STATUS_SCHEMA.md`.**
   Fixed: full vocabulary defined (`Pending` / `Approved` / `Rejected` /
   `Needs Revision`), plus a machine-enforceable gate rule tying `Approved`
   to `lifecycle: Winner` + non-empty asset sources.

5. **`type: review` (used by `REVIEW_TEMPLATER.md`) and `LOC_XXX` /
   `location` references (used by `NEW_SCENE_TEMPLATER.md` and
   `PRODUCTION_GUIDE.md`'s `LOC_003` blocker) were not in the `type`
   enum.** Fixed: both `review` and `location` added to the enum, with
   `review` explicitly scoped out of canon-node completeness checks (it's an
   audit-trail document, not a production asset).

6. **`LOC_003` was named as a hard EP_002 blocker but never created.**
   Fixed: `01_NODES/locations/LOC_003.md` created as a `status.lifecycle:
   Draft` stub — structurally present so `PRODUCTION_GUIDE.md`'s readiness
   gate and `SERIES_PIPELINE.md`'s bottleneck check no longer fail on a
   missing node. Content (visual description, continuity notes) still needs
   to be authored before SCENE_004 compiles.

## Apply Instructions (v4.3 → v4.3.1)

1. Overwrite `03_SYSTEM/STATUS_SCHEMA.md`, `01_NODES/characters/CHAR_002_SERAPH.md`,
   `01_NODES/state/STATE_001_REN_POST_EP001.md`, and `03_SYSTEM/DASHBOARD.md`
   with the v4.3.1 versions.
2. Add `01_NODES/locations/LOC_003.md` (new file).
3. `SHOT_001.md`, `SHOT_002.md`, all three templates, `PRODUCTION_GUIDE.md`,
   and `SERIES_PIPELINE.md` are **unchanged** — their `status:` shapes were
   already correct under v4.3.1.
4. Re-run `validate_vault.py` → `health_check.js` → `verify_manifest.js`
   against the new `STATUS_SCHEMA.md`. These scripts are not included in
   either the v4.3 or v4.3.1 patch archives — if they currently hardcode
   assumptions about a flat `lifecycle_status`/`role_status` shape, update
   them to read `status.<subkey>` per the table in `STATUS_SCHEMA.md`.
5. Remaining items **not** addressed by v4.3.1 (carried forward, unchanged
   in severity from the prior review):
   - `04_EXPORT/winners/SHOT_001_image.png`, `SHOT_001_video.mp4`,
     `SHOT_002_image.png`, `SHOT_002_video.mp4` are referenced but not
     present in any patch archive — these are real-asset prerequisites, not
     a schema bug.
   - `LOC_003.md` is now structurally present but its creative content
     (location brief) is a placeholder and still needs authoring.
   - SHOT_003–007 do not exist yet; EP_001 package is not complete.
   - `validate_vault.py` / `health_check.js` / `verify_manifest.js` are
     referenced by every system doc but not bundled in any patch — confirm
     they live elsewhere in the vault and update them per item 4 above.
