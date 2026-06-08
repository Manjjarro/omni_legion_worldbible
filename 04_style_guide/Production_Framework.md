---
type: Technical Production Guide
resolution: 1920x1080 (16:9)
framerate: 24fps
engine_target: Flux 2 Dev / Kling AI / CapCut
---
---
type: Technical Production Guide
resolution: 1920x1080 (16:9)
framerate: 24fps
engine_target: Flux 2 Dev / Kling AI / CapCut
status: Active
---

# Style Guide: Low-Motion, High-Impact Pipeline

## 1. The Visual Paradigm
To achieve professional-grade viewer retention, do not force AI video engines to render complex, fluid brawls. Instead, use a **"Low-Motion, High-Impact"** animation style. 

- **Concept:** Lock down highly cinematic 2D environment plates and foreground character assets, then fake intense pacing via camera parallax and aggressive sound design.
- **The Rule:** Every shot is a composition of static layers animated via camera movement, not frame-by-frame character animation.

---

## 2. Multi-Plane Editing Layering (CapCut Workspace)
To build a dynamic composition without visual glitching, isolate your elements across four strict timeline tracks:

| Track | Layer Name | Content |
| :--- | :--- | :--- |
| **Track 4** | **VFX Overlay** | Transparent smoke, glowing red eye emission vectors, cyan dust sparks. |
| **Track 3** | **Foreground** | Isolated character asset (Ren) with background removed (transparency). |
| **Track 2** | **Midground** | Kinetic impacts, flying concrete shards, or debris plates. |
| **Track 1** | **Background** | The locked cinematic environment plate (corrupted alleyway, flesh zone). |

### Z-Depth Parallax Keyframing
Manually scale your layers at different rates across a 3-4 second timeline loop to generate optical depth:
- **Background (Track 1):** Scale smoothly from `100%` to `103%`.
- **Foreground (Track 3):** Scale sharply from `100%` to `112%`.

---

## 3. The "CHECK" Quality Assurance Loop
Before approving any generated clip for your timeline, run it through this QA logic:

1. **Anatomy Check:** Are hands/fingers clearly defined? (If not, re-prompt with specific hand-grip descriptors).
2. **Style Drift:** Does the generation contain 3D shading or gradients? (If yes, it violates the "0% 3D gradient" rule).
3. **Consistency:** Does the character match the [[Ren.md]] lock sheet?
4. **Action Trigger:** If the clip fails, append the following to your next prompt: *"Enforce absolute rigid geometric continuity. Correct [Flaw]. Fixed lighting source."*

---

## 4. Audio Architecture Requirements
Because on-screen character movement is controlled and deliberate, your sound design must carry the kinetic weight of the action.

- **Voice Tracking:** Deep-register, monotone, gravelly AI voice profiles (ElevenLabs) to match Ren's cold, calculating pragmatism.
- **Foley Library:** Visceral, crunching audio accents mixed into every movement:
  - **Armor:** Ceramic cracking, metallic scraping.
  - **Environment:** Concrete shattering, bone/chitin snapping.
- **Score:** Low-register, rumbling industrial dark-synth to mask potential AI micro-stutters and solidify the grimdark atmosphere.

---

## 5. Asset Registry Pathing
- **Character Lock:** `[[02_Characters/Ren.md]]`
- **Video Analysis Logs:** `[[04_Style_Guide/Video_Analysis/]]`
- **Environment Plates:** `[[03_Environments/]]`