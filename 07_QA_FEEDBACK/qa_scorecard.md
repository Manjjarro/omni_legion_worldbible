---
type: quality_control_rubric
version: 2.1
target_threshold: 42/50
---

# PRODUCTION QA SCORING METRIC

This rubric is used to evaluate all image layers generated via Perchance before they are cleared for compositing on the 24fps video timeline.

## 1. Evaluation Scoring Vectors (Max 50 Points)

### A. Style Lock Adherence (Max 10 Points)
- **10 pts:** Pure 2D flat cell-shading. Flawless ink contours. 0% gradient drift.
- **5 pts:** Minor soft highlighting detected on background elements.
- **0 pts:** Render exhibits volumetric 3D modeling, airbrushed textures, or photorealism. **(Automatic Rejection)**

### B. Invariant Structural Continuity (Max 10 Points)
- **10 pts:** All structural traits match character/asset specs perfectly (e.g., Ren's messy silver undercut, solid crimson eyes).
- **5 pts:** Hair or outfit details are slightly altered but repairable via minor editing overlays.
- **0 pts:** Eyes are wrong color, undercut is missing, or costume layers are completely morphed.

### C. Anatomical Topology Safety (Max 10 Points)
- **10 pts:** Hands are crisply defined with distinct, anatomically accurate fingers tightly wrapped around handles/grips.
- **5 pts:** Hands are hidden or posture is stiff, but lineart structures remain intact.
- **0 pts:** Melted digits, extra limbs, or severe structural distortion.

### D. Layer Composition Isolation (Max 10 Points)
- **10 pts:** Pure, clean asset isolation (character flatly set against a solid white background, ready for immediate transparent alpha keying).
- **5 pts:** Isolation contains light background spill or trace shadow bleed.
- **0 pts:** Character is fused directly into complex scene architecture.

### E. Resolution & Line Sharpness (Max 10 Points)
- **10 pts:** Razor-sharp lineart cuts, high ink contrast, zero artifact blurring.
- **5 pts:** Clean frame but shows slight compression artifacts near edges.
- **0 pts:** Smudged digital blocks, blurry textures, or unreadable details.

## 2. Production Threshold Action Execution
* **Score $\ge$ 42:** Clear asset for production. Commit file path directly into `/04_ASSETS/`.
* **Score < 42:** Trigger prompt rejection log state. Append `CHECK` flag, isolate the failing vector, and push back to generation compiler loop.