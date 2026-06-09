# OMNI-STUDIO-OS — Setup & Start Guide

## Plugin Requirements
| Plugin | Setting to enable |
|---|---|
| Dataview | Enable JavaScript Queries |
| Templater | Template folder → `Templates` |
| Core: Files & Links | Automatically update internal links → ON |

## Start Order
1. Open the vault in Obsidian
2. Install and enable **Dataview**, turn on **JavaScript Queries**
3. Install and enable **Templater**, set template folder to `Templates`
4. Enable **Automatically update internal links** in Settings → Files and links
5. Open `03_SYSTEM/DASHBOARD.md` — all six tables should render
6. Open `03_SYSTEM/PROMPT_ENGINE.md` — the prompt output block should render under the heading
7. Open `03_SYSTEM/VIDEO_ENGINE.md` — the video prompt block should render

## Adding New Shots
1. Create `01_NODES/shots/SHOT_002.md` from the SHOT_TEMPLATE
2. Link it in `01_NODES/scenes/SCENE_001.md` frontmatter: add `- [[SHOT_002]]`
3. Create a matching `02_PRODUCTION/generated_images/SHOT_002_IMG_RUN_001.md` from IMAGE_RUN_TEMPLATE
4. Log the result in `02_PRODUCTION/run_logs/`

## Frontmatter Link Rule (Critical)
Wiki-links in YAML frontmatter must be **unquoted**:

```yaml
# CORRECT — Dataview resolves this as a link object
scene: [[SCENE_001]]
characters:
  - [[CHAR_001_REN]]

# WRONG — Dataview treats this as a plain string; dv.page() returns undefined
scene: "[[SCENE_001]]"
characters:
  - "[[CHAR_001_REN]]"
```

## Watch Points
- Never rename a file without checking that Obsidian auto-updates all links (requires the setting above)
- Never add a new scene without a matching shot note
- Never write world-rule changes inside prompts — update WORLD_STATE.md instead
- Keep image and video engine target fields updated when switching shots or scenes
