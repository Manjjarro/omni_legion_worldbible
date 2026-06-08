---
type: system_arc_engine
active_episode: EP_001
system_state: operational
---

# EPISODE STORY CONTROLLER

## 1. Pacing & Pressure Envelope
Every scene added to `/02_SCENES/` must strictly register its narrative pressure index (1–10) against this global envelope.

| Scene ID | Target Target Focus | Pressure Index | Visual State Constraints |
| :--- | :--- | :--- | :--- |
| `S_001_001` | Ren Isolation / Alleyway | 2/10 | Low movement, high-contrast shadows, cold world setup. |
| `S_001_002` | First Contact / Kinetic Strike | 6/10 | Medium motion frame, sharp weapon flash, flat kinetic lines. |
| `S_001_003` | Core Activation / Awakening | 9/10 | Extreme high-contrast lighting, crimson bloom emission. |

## 2. Escalation Enforcement Rule
* Scenes cannot jump more than **3 pressure integers** sequentially. 
* Sudden high-intensity action frames without a graded build-up prompt sequence are flagged as **Invalid State Transitions** and rejected automatically during compilations.