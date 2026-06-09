```dataviewjs
let script = dv.current().script;

if (!script) {
  dv.paragraph("Paste script into `script:` frontmatter field.");
  return;
}

// Split into scenes using simple logic
let chunks = script.split(/Scene\s*\d+:/i).filter(Boolean);

dv.header(2, "GENERATED SCENE STRUCTURE");

chunks.forEach((c, i) => {
  dv.paragraph(`
---
type: scene
id: AUTO_SCENE_${i+1}
sequence: ${i+1}
objective: auto-generated
camera: static
environment: extracted from script
characters: []
---

${c.trim()}
`);
});
```