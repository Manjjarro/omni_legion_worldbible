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

if (!cfg.target_scene) {
    dv.paragraph("⚠️ Missing target_scene in frontmatter.");
} else {
    const scene = dv.page(cfg.target_scene);

    if (!scene) {
        dv.paragraph("❌ Scene not found.");
    } else {
        const style =
            "sharp 2D cell-shaded anime style, bold hand-drawn ink contours, flat color blocks, high-contrast lighting, minimal gradients, cinematic keyframe finish";

        const chars = (scene.characters ?? [])
            .map(x => dv.page(x))
            .filter(Boolean)
            .map(x => `${x.name ?? x.file.name} tier ${x.tier ?? 1}`);

        const output = [
            ...chars,
            scene.title ?? scene.file.name,
            scene.visual_anchor ?? "",
            style
        ]
            .filter(Boolean)
            .join(", ");

        dv.header(3, `📋 Output Prompt String Locked for: ${scene.file.name}`);
        dv.el("pre", output);
    }
}
```