---
type: system
id: PROMPT_ENGINE
scene: "[[SCENE_001]]"
---
---
type: system
id: PROMPT_ENGINE
scene: "[[SCENE_001]]"
---

```dataviewjs
// ====================================================================
// PROMPT ENGINE v4.2 — POLISHED FINAL BUILD
// ====================================================================

const sceneLink = dv.current().scene;
if (!sceneLink) {
  dv.paragraph("⚠️ Add `scene: [[SCENE_XXX]]` to this note's frontmatter.");
  return;
}

const scene = dv.page(sceneLink);
if (!scene) {
  dv.paragraph(`⚠️ Scene ${sceneLink} not found.`);
  return;
}

const chars = (scene.depends_on || []).map(l => dv.page(l)).filter(Boolean);
const styleNote = dv.pages('"01_NODES/styles"').where(s => s.type === "style").first();
const rigNote = dv.page("Templates/CAMERA_RIG_LIBRARY") || dv.page("Templates/CAMERA_RIG_LIBRARY.md");

let charBlock = chars.map(c => `
CHARACTER: ${c.name || c.identity_anchor || c.file.name}
IDENTITY: ${c.identity_anchor || ""}
STABILITY: ${c.stability ?? 0.5} | MOTION: ${c.motion_tolerance ?? "low"}
LOCKS: ${[c.hair, c.eyes, c.clothing, c.body].filter(Boolean).join(" | ")}
`).join("\n---\n") || "No characters linked.";

let cameraRig = scene.camera || "static composition, minimal motion";
if (rigNote && rigNote.shots && rigNote.motion) {
  const shot = rigNote.shots[scene.shot_type] || scene.shot_type || "";
  const motion = rigNote.motion[scene.motion_preset] || scene.motion_preset || "";
  
  // Clean punctuation stitcher: avoids stray leading/trailing periods automatically
  cameraRig = [shot, motion].filter(Boolean).join(". ").trim();
}

const prompt = `PROMPT CORE

${charBlock}

OBJECTIVE:
${scene.objective || ""}

SCENE STATE:
${scene.scene_state || ""}

ENVIRONMENT:
${scene.environment || ""}

CAMERA RIG:
${cameraRig}

DURATION: ${scene.duration ?? 4}s

STYLE:
${styleNote?.style_core || "cinematic 2D anime, ink linework, flat shading"}

NEGATIVE:
${styleNote?.negative_core || "3D, blur, watermark, distortion, bad anatomy"}
`;

dv.header(2, `MASTER PROMPT — ${scene.file.name}`);
dv.code(prompt.trim());