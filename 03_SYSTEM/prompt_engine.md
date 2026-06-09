---
type: engine
id: PROMPT_ENGINE
target_scene: [[SCENE_001]]
---

# ⚙️ Image Prompt Compiler

**Target Scene:** [[SCENE_001]]

```dataviewjs
// PROMPT_ENGINE.md — Image prompt compiler
// FIX 1: target_scene is unquoted in frontmatter so Dataview resolves it as a link object.
// FIX 2: resolvePath() handles both object {path:...} and raw string fallbacks safely.

function resolvePath(val) {
    if (!val) return null;
    if (typeof val === "object" && val.path) return val.path;
    return String(val).replace(/^\[\[|\]\]$/g, "");
}

const cfg = dv.current();

if (!cfg || !cfg.target_scene) {
    dv.paragraph("⚠️ No target_scene set in frontmatter. Add: target_scene: [[SCENE_XXX]]");
} else {
    const scenePath = resolvePath(cfg.target_scene);
    const scene = dv.page(scenePath);

    if (!scene) {
        dv.paragraph("❌ Scene not found: " + scenePath);
    } else {
        const styleConstant = [
            "sharp 2D cell-shaded anime style",
            "bold hand-drawn ink contours",
            "flat color blocks",
            "high-contrast lighting",
            "minimal gradients",
            "cinematic keyframe finish"
        ].join(", ");

        const characterBlocks = (scene.characters ?? [])
            .map(ref => dv.page(resolvePath(ref)))
            .filter(Boolean)
            .map(char => {
                return [
                    char.name ?? char.file.name,
                    char.tier !== undefined ? `tier ${char.tier}` : null,
                    char.status ?? null,
                    char.file?.name ? `asset ${char.file.name}` : null
                ].filter(Boolean).join(" • ");
            });

        const sceneBits = [
            scene.title       ? `scene: ${scene.title}`              : null,
            scene.sequence !== undefined ? `sequence: ${scene.sequence}` : null,
            scene.visual_anchor ? `environment: ${scene.visual_anchor}` : null
        ].filter(Boolean);

        const output = [
            ...characterBlocks,
            ...sceneBits,
            styleConstant
        ].filter(Boolean).join(", ");

        dv.header(3, `📋 Prompt locked for: ${scene.file.name}`);
        dv.el("pre", output);
    }
}
```
