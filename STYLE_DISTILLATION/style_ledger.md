---
type: style_distillation_ledger
active_sprint: SPRINT_001
target_stability_index: 90%
---

# STYLE DISTILLATION LEDGER

Use this log format to record empirical discoveries across batch generation sequences (10–20 images per batch) to isolate model stability.

## 1. Active Run Log Matrix

| Batch ID | Base Seed | Engine Mode | Average QA Score | Identified Visual Deviations / Notes |
| :--- | :--- | :--- | :--- | :--- |
| `B_001_01` | 88492015 | Perchance Flux Dev | 44/50 | Flat lineart locked perfectly. Hand geometry stabilized using action prompt descriptors. |
| `B_001_02` | Random | Perchance Flux Dev | --/50 | Pending generation execution run. |

## 2. Extracted Visual Patterns (Pattern Compression Engine)
* *Pattern 01 (Verified):* High Guidance Scale inputs (values 8-9) on Perchance severely degrade the flat cell-shaded effect and introduce muddy digital smudges. Keep Guidance scale locked at **6.5 to 7.0**.
* *Pattern 02 (Verified):* Specifying colors via precise dark values (e.g., *dark slate-grey high-collar trench coat*) prevents the model from generating oversaturated, distracting primary tones.

## 3. Style Lock Update Actions
* When a visual trait shows zero drift over 20 concurrent images, copy the exact descriptive phrase directly into `/00_CANON/style_lock.md` to update the global art direction ruleset.