---
type: engine
id: PROMPT_ENGINE

target_scene: "[[SCENE_001]]"
---

# ⚙️ Prompt Compiler

Target:
[[SCENE_001]]

```dataviewjs
const cfg=dv.current();

if(!cfg.target_scene){
dv.paragraph("Missing target scene");
return;
}

const scene=dv.page(cfg.target_scene);

if(!scene){
dv.paragraph("Scene not found");
return;
}

const style=
"sharp 2D anime, bold contours, cinematic lighting";

const chars=
(scene.characters??[])
.map(x=>dv.page(x))
.filter(Boolean)
.map(x=>
`${x.name} tier ${x.tier}`
);

const output=[
...chars,
scene.title,
scene.visual_anchor,
style
]
.filter(Boolean)
.join(", ");

dv.header(
3,
`Output → ${scene.file.name}`
);

dv.code(
output,
"text"
);
```