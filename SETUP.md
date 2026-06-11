# Setup

This project is designed for a hybrid workflow:

- **Obsidian** = canon, structure, story memory
- **Cursor** = compilation, validation, packaging, state propagation

## Required plugins in Obsidian
- Dataview
- Templater
- Optional: Advanced Tables, Buttons, QuickAdd

## Required Cursor setup
Create or open the project folder in Cursor and keep these rules available:
- `.cursor/rules/grimverse_canon.mdc`
- `.cursor/rules/grimverse_shot_compiler.mdc`
- `.cursor/rules/grimverse_validation.mdc`
- `.cursor/rules/grimverse_state_propagation.mdc`
- `.cursor/rules/grimverse_thumbnail.mdc`
- `.cursor/rules/grimverse_episode_packager.mdc`

## Recommended folders
- `01_NODES/` for canon
- `02_PRODUCTION/` for runs, packages, reviews
- `03_SYSTEM/` for guides and dashboards
- `04_EXPORT/` for final deliverables

## Operating rules
- Every shot must belong to exactly one scene
- Every scene must belong to exactly one episode
- Every episode must belong to exactly one arc
- Every character must have identity anchors and a state node
- Every run must be scored before promotion
- Use Cursor to compile shot packages
- Keep world, event, and state data inside Obsidian
- Keep final generator prompts short and visual
