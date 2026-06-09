```dataviewjs

let scenePath = dv.current().scene;

if (!scenePath) {
  dv.paragraph("⚠️ Set `scene: [[SCENE_XXX]]` in frontmatter.");
  return;
}

let s = dv.page(scenePath);

if (!s) {
  dv.paragraph(`⚠️ Scene not found: ${scenePath}`);
  return;
}

// --------------------
// LOAD DEPENDENCIES
// --------------------
let style = dv.page(s.style);

let chars = (s.characters ?? [])
  .map(c => dv.page(c))
  .filter(Boolean);

// --------------------
// CHARACTER BLOCK (SAFE + ENHANCED)
// --------------------
let charBlock = chars.map(c => {
  let anchor = c.identity_anchor || c.name || "Unnamed";
  return `CHAR: ${anchor}
STABILITY: ${c.stability ?? 0.5}
MOTION: ${c.motion_tolerance ?? "low"}`;
}).join("\n\n");

// --------------------
// MOTION GRAMMAR ENFORCEMENT
// --------------------
let motion = s.motion_level ?? "static-first";

// --------------------
// FINAL PROMPT STRUCTURE
// --------------------
let prompt = `PROMPT CORE:

${charBlock}

SCENE OBJECTIVE: ${s.objective}
ENVIRONMENT: ${s.environment}
CAMERA: ${s.camera}
DURATION: ${s.duration ?? 4}s
MOTION MODE: ${motion}

STYLE: ${style?.identity_anchor ?? "default style"}

STYLE CORE:
${style?.["# STYLE CORE"] ?? ""}

NEGATIVE:
${style?.negative ?? "3D, blur, distortion, text, watermark, anatomy errors, motion artifacts"}`;

// --------------------
// OUTPUT
// --------------------
dv.header(2, "OMNI-LINEAGE MASTER ENGINE");
dv.code(prompt);
```