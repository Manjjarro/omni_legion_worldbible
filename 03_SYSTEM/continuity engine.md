```dataviewjs
let scenes = dv.pages('"01_NODES/scenes"');

let chars = dv.pages('"01_NODES/characters"');

dv.header(2, "TEMPORAL CONTINUITY MATRIX");

// Build evolution map
for (let c of chars) {

  let relatedScenes = scenes.where(s =>
    (s.characters ?? []).includes(c.file.name)
  );

  let stabilityTrend =
    c.stability ?? 0.5;

  dv.paragraph(
`CHARACTER: ${c.identity_anchor ?? c.name}
STABILITY: ${stabilityTrend}
SCENES USED IN: ${relatedScenes.length}
MOTION RULE: ${c.motion_tolerance ?? "low"}`
  );
}
```