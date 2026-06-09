```dataviewjs
let scene = dv.current().scene;

if (!scene) {
  dv.paragraph("Select a scene in frontmatter.");
  return;
}

let s = dv.page(scene);
if (!s) {
  dv.paragraph("Scene not found.");
  return;
}

// -------------------------
// LOAD STYLE
// -------------------------
let style = dv.page(s.style);

// -------------------------
// LOAD CHARACTERS
// -------------------------
let chars = (s.characters ?? [])
  .map(c => dv.page(c))
  .filter(Boolean);

// -------------------------
// STYLE FILTER (deterministic)
// -------------------------
function clean(text, styleNode){
  if (!text) return "";

  let out = text;

  let tokens = styleNode?.tokens_to_strip ?? [];

  for (let t of tokens) {
    out = out.split(t).join("");
  }

  return out.replace(/\s+/g,' ').trim();
}

// -------------------------
// CHARACTER BLOCK
// -------------------------
let charBlock = chars.map(c =>
  `CHAR: ${c.identity_anchor}`
).join("\n");

// -------------------------
// SCENE CORE
// -------------------------
let sceneCore =
`SCENE: ${s.objective}
ENV: ${s.environment}
CAMERA: ${s.camera}`;

// -------------------------
// FINAL PROMPT
// -------------------------
let prompt =
`${charBlock}

${sceneCore}

STYLE: ${style?.file?.name ?? "default"}

NEGATIVE: ${style?.negative ?? ""}`;

dv.header(2, "MASTER PROMPT ENGINE");
dv.code(clean(prompt, style));

// -------------------------
// TIMELINE LAYER
// -------------------------
dv.header(3, "TIMELINE SEQUENCE");

dv.table(
["Scene", "Order", "Duration"],
[[s.file.name, s.sequence ?? 1, s.duration ?? 4]]
);
```