---
id: CHAR_002
type: character
version: "4.3.1"
name: Seraph
status:
  role: Antagonist
  character_state: Active
pronouns: she/her
identity_anchor:
  hair: silver-white, shoulder-length
  eyes: violet, slit pupils
  silhouette: tall, angular armor, asymmetric pauldrons
  palette: "#C0C0C0 / #6A0DAD / #1A1A2E"
stability: locked
last_updated: 2026-06-12
---

## Identity Anchor Notes

All shot prompts referencing CHAR_002 must include verbatim:
"silver-white shoulder-length hair, violet slit-pupil eyes, tall angular matte-black armor with asymmetric left pauldron, cool palette #C0C0C0/#6A0DAD"

Pronoun lock: she/her. Flag any node using "he" as Identity Drift — severity HIGH.

## Changelog (v4.3 → v4.3.1)

- `status.lifecycle: Active` removed. Lifecycle values (Planned/Draft/Review/
  Winner/Complete/Archived) describe shot/scene/episode/event production
  stages and were never valid on a character node — `Active` was an
  undeclared value under the old schema.
- `status.role: Antagonist` retained — this was already correct.
- `status.character_state: Active` added. This is the field that tracks
  Seraph's ongoing narrative standing (Active / Wounded / Captured /
  Deceased / Inactive) independent of her casting role. Update this field,
  not `role`, when Seraph's in-story status changes.
