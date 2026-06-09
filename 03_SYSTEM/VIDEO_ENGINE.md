---
type: engine
id: VIDEO_ENGINE
target_shot: [[SHOT_001]]
---

# 🎞️ Video Prompt Compiler

**Target Shot:** [[SHOT_001]]

```dataviewjs
// VIDEO_ENGINE.md — Video prompt compiler
// FIX 1: target_shot is unquoted in frontmatter so Dataview resolves it as a link object.
// FIX 2: resolvePath() handles both object {path:...} and raw string fallbacks safely.

function resolvePath(val) {
    if (!val) return null;
    if (typeof val === "object" && val.path) return val.path;
    return String(val).replace(/^\[\[|\]\]$/g, "");
}

const cfg = dv.current();

if (!cfg || !cfg.target_shot) {
    dv.paragraph("⚠️ No target_shot set in frontmatter. Add: target_shot: [[SHOT_XXX]]");
} else {
    const shotPath = resolvePath(cfg.target_shot);
    const shot = dv.page(shotPath);

    if (!shot) {
        dv.paragraph("❌ Shot not found: " + shotPath);
    } else {
        const scene = shot.scene ? dv.page(resolvePath(shot.scene)) : null;

        const chars = (shot.characters ?? [])
            .map(ref => dv.page(resolvePath(ref)))
            .filter(Boolean)
            .map(char => char.name ?? char.file.name);

        const motionBits = [
            shot.camera           ? `camera: ${shot.camera}`                         : null,
            shot.motion           ? `motion: ${shot.motion}`                         : null,
            shot.duration_seconds !== undefined ? `duration: ${shot.duration_seconds}s` : null,
            shot.fps              !== undefined ? `fps: ${shot.fps}`                 : null
        ].filter(Boolean);

        const output = [
            chars.length      ? `characters: ${chars.join(", ")}` : null,
            scene?.title      ? `scene: ${scene.title}`           : null,
            ...motionBits,
            "cinematic animated motion, coherent continuity, subtle environmental movement"
        ].filter(Boolean).join(", ");

        dv.header(3, `📋 Video prompt locked for: ${shot.file.name}`);
        dv.el("pre", output);
    }
}
```
