# NO DRIFT CONTRACT (GLOBAL ENFORCEMENT LAYER)

This document overrides all scene, episode, and character files in terms of execution stability.

---

## 1. CHARACTER IMMUTABILITY RULE

Once a character visual is defined in /01_CHARACTERS:

- Hair, face structure, eye type = IMMUTABLE
- Outfit = IMMUTABLE per tier unless explicitly upgraded
- Expression baseline = IMMUTABLE

Any deviation = FAILURE STATE

---

## 2. STYLE LOCK RULE

All outputs MUST include:

sharp 2D cell-shaded anime style, bold ink contours, flat color blocks, high contrast lighting, 0% 3D gradients, MAPPA/Wit Studio keyframe finish

If missing → INVALID OUTPUT

---

## 3. SCENE CONTINUITY RULE

No scene is allowed to introduce:

- new physics rules
- new visual systems
- new character abilities
unless explicitly declared in episode_controller.md

---

## 4. GENERATION FAILURE DEFINITION

A generation is FAILED if:

- character drift detected
- lighting style shift occurs
- anatomy distortion exceeds acceptable range
- tone shifts outside canonical range

FAILED outputs must not be stored in /04_ASSETS/