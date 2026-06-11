# Grimverse Studio OS 3.3

A hybrid Obsidian + Cursor operating system for dark cinematic AI series production.

## Core principle
Obsidian is the canon layer.
Cursor is the runtime/compiler layer.

## Pipeline
Universe → Series → Arc → Episode → Scene → Shot → Package → Review → Winner → Export

## Design goals
- Prevent style bleed between series
- Keep character identity stable
- Compile generator-ready prompts from structured notes
- Track winners, failures, deltas, and continuity
- Support Shorts, episodes, and season compilation
- Separate canon from execution logic

## Where to work
### In Obsidian
- Characters
- State nodes
- Episodes
- Scenes
- Shots
- Events
- Lore
- Factions
- Locations

### In Cursor
- Prompt compilation
- Thumbnail compilation
- Validation
- Winner packaging
- State propagation
- Batch generation prep

## Start here
1. Read `03_SYSTEM/CURSOR_HYBRID_GUIDE.md`
2. Read `03_SYSTEM/WORLD_STATE.md`
3. Open the episode → scene → shot you want to produce
4. Use Cursor to compile the shot package
5. Generate images and video from the compiled prompt
6. Log the winners back into `02_PRODUCTION/`
7. Run `03_SYSTEM/HEALTH_CHECK.md` after edits

## Series concept
Current series: `Grimverse`
Tone: grim dark / dark fantasy / post-collapse sci-fi noir
Protagonist type: antihero with wins, losses, and consequences

## Version History
- **V1.0**: Core hierarchy, character anchors, prompt/video/health engines
- **V2.0**: Added EVENT_SYSTEM, ARC_STATE_LOCK_ENGINE, CHARACTER_STATE layer, SCENE_EXPANSION_ENGINE
- **V2.1**: Integration hardening — MANIFEST sync, PROMPT_ENGINE wired to state/events, HEALTH_CHECK extended to V2 layers, SCENE_002/003 fleshed out, EVENT_001 and STATE_001_REN live nodes created, CHARACTER_STATE_TEMPLATER added
- **V2.2**: Full V2.2 hardening — psychology injection in both engines, VIDEO_ENGINE parity with PROMPT_ENGINE, Prompt Pruner (top-3 event cap), DELTA_VISUALIZER dashboard, COMMIT_WINNER_TEMPLATER with auto-propagation workflow, SHOT_004–007 fully fleshed, EP_002 briefed, quoted frontmatter links standardized, EVENT_001 delta_applied confirmed
- **V2.6**: Prompt engine cleanup, short-form prompt output, state parsing repair, version normalization
- **V3.0**: Hybrid Obsidian + Cursor runtime, Cursor rule engine added, Obsidian compiler pages converted to canon handoff docs, shot package spec added, hybrid workflow added
- **V3.3**: Frontmatter link normalization, executable vault validator, stronger asset audit, tighter runtime rule enforcement, root-folder normalization
