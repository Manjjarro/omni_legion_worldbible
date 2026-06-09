```dataviewjs
let scene = dv.page("01_NODES/scenes/SCENE_001");

if (!scene) {
  dv.paragraph("Scene not found");
  return;
}

let chars = scene.depends_on ?? [];
let char = null;
let style = null;

for (let c of chars) {
  let node = dv.page(c);
  if (!node) continue;

  if (node.type === "character") char = node;
  if (node.type === "style") style = node;
}

let prompt =
`CHARACTER: ${char?.identity_anchor ?? "missing"}
SCENE: ${scene.scene}
CAMERA: ${scene.camera}
ENVIRONMENT: ${scene.environment}
STYLE: ${style?.stability ?? "default"}
NEGATIVE: ${style?.negative_style ?? ""}`;

dv.header(2, "COMPILED PROMPT");
dv.code(prompt);
```