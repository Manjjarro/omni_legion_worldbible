---
type: engine
id: PROMPT_ENGINE
target_scene: "[[SCENE_001]]"
---

# ⚙️ Prompt Compiler

Target:
[[SCENE_001]]

```dataviewjs
const cfg = dv.current();

if (!cfg || !cfg.target_scene) {
    dv.paragraph("❌ **Missing target_scene in frontmatter.**");
    return;
}

// Extract the target page safely
const scene = dv.page(cfg.target_scene);

if (!scene) {
    dv.paragraph(`❌ **Scene file not found or unindexed:** \`${cfg.target_scene}\``);
    dv.paragraph("💡 *Check if SCENE_001.md exists exactly in your '01_NODES/scenes/' directory.*");
    return;
}

const style = "sharp 2D anime, bold contours, cinematic lighting";

// Defensively extract characters only if the array exists
let chars = [];
if (scene.characters && Array.isArray(scene.characters)) {
    chars = scene.characters
        .map(x => dv.page(x))
        .filter(Boolean)
        .map(x => `${x.name || "Unknown"} tier ${x.tier || 1}`);
}

const output = [
    ...chars,
    scene.title || "",
    scene.visual_anchor || "",
    style
]
.filter(Boolean)
.join(", ");

dv.header(3, `📋 Output → ${scene.file.name}`);
dv.code(output, "text");