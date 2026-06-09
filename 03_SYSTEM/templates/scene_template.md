---
type: scene
id: SCENE_XXX
sequence: 0
episode: 1
character_links: []
style_link: "STYLE_001"
camera_movement: "Static/Slow Pan"
duration: 4
storyboard_status: "Planned"
continuity_score: 1.0
---

## Scene Narrative Action
- **Environment Plate**: 
- **Character Action/Framing**: 

## Compiled Prompt Output
```dataviewjs
// Local Prompt Compiler Execution Block
const page = dv.current();
let prompt = "";

// 1. Fetch Style Constant
if(page.style_link) {
    const stylePage = dv.page(`01_NODES/styles/${page.style_link}`);
    if(stylePage) {
        prompt += stylePage.core_style_constant || "";
    }
}

// 2. Fetch Character Anchors
if(page.character_links && page.character_links.length > 0) {
    for(let charId of page.character_links) {
        const charPage = dv.page(`01_NODES/characters/${charId}`);
        if(charPage) {
            prompt += " " + (charPage.visual_anchor_descriptors || "");
        }
    }
}

// 3. Append Scene Dynamics
prompt += ` Context: ${page.file.name}. Action: ${page.scene_narrative_action}. Camera: ${page.camera_movement}.`;

dv.header(3, "Generated Prompt Array");
dv.code(prompt.trim(), "text");