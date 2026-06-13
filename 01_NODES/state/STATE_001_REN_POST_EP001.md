---
id: STATE_001
type: state
version: "4.3.1"
character: CHAR_001_REN
episode_context: EP_001
status:
  state_lifecycle: Active
delta_applied: true
scarring_log:
  - event: EVENT_001_FIRST_PULSE
    type: trauma_residue
    descriptor: "Pulse backlash — neural overload scar, right arm tremor onset"
  - event: SCENE_003_CIVILIAN_CHOICE
    type: moral_cost
    descriptor: "Civilian neutralisation — emotional containment fracture, reputation vector shift negative"
mental_state: fractured_resolve
stability: 0.72
continuity_score: 0.90
last_updated: 2026-06-12
---

## State Notes

Ren exits EP_001 with dual scarring: physical (arm tremor, pulse residue) and moral (SCENE_003 civilian cost). Both must propagate into EP_002 shot prompts — expressional cues (slight right-hand favoring) and behavioral tone (reduced verbal output, increased stillness).

EP_002 compile must read this state before generating any CHAR_001 foreground layer.

## Changelog (v4.3 → v4.3.1)

- `status.lifecycle: Active` renamed to `status.state_lifecycle: Active`.
  The intended meaning ("this is the current/operative state snapshot for
  CHAR_001_REN") is unchanged — only the field name changed, to a vocabulary
  defined for state nodes (`Active` / `Archived`) instead of borrowing the
  shot/scene lifecycle vocabulary, where `Active` was never a legal value.
- `continuity_score: 0.90` added. State nodes were the only canon-data type
  with no continuity score, which made cross-node continuity comparisons
  (e.g. in `DASHBOARD.md`) impossible. Value derived as the mean of the two
  EP_001 winner shots feeding this state (SHOT_001: 0.91, SHOT_002: 0.89) as
  a baseline; re-score manually if scarring entries materially change the
  visual continuity contract for EP_002.
- Per the new `state_lifecycle` invariant: if/when `STATE_002_REN_*` is
  created for EP_002, this node's `state_lifecycle` must be flipped to
  `Archived` in the same edit.
