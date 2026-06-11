---
type: system
id: CURSOR_HYBRID_GUIDE
version: '4.3'
---

# Cursor Hybrid Guide

## Roles
### Obsidian
- Canon storage
- Episode/scene/shot planning
- Character, state, event, faction, location memory
- Review history and continuity history

### Cursor
- Runtime compiler
- Validation assistant
- Package builder
- State propagation helper
- Thumbnail prompt builder

## Rule of separation
Do not put executable logic in Obsidian when Cursor can do it faster and cleaner.
Do not let Cursor rewrite canon without an explicit packaging step.

## Daily production flow
1. Open the episode in Obsidian.
2. Open the scene.
3. Open the shot.
4. Ask Cursor to compile the shot package.
5. Copy the final prompt into the image generator.
6. Select the image winner.
7. Generate video from the winner.
8. Log the run in `02_PRODUCTION/`.
9. Run state propagation if the shot changed canon.
10. Repeat for the next shot.

## Best command patterns for Cursor
- Compile shot package for `SHOT_001`
- Generate thumbnail prompt for `SHOT_001`
- Validate `EP_002`
- Propagate winner for `SHOT_006`
- Build episode package for `EP_001`
- Audit continuity for `SCENE_003`

## What Cursor should output
- Final image prompt
- Short negative prompt
- Final video prompt
- Thumbnail prompt
- Continuity checklist
- Failure log template
- State delta when a winner changes canon

## What must stay internal
- World history
- Event chains
- State deltas
- Forbids
- Story explanation
- Review reasoning

Only the visual payload should reach the generator prompt.


## Link resolution rule
For Arc, Episode, Event, and State notes, Cursor should resolve by `id` and aliases, not by filename alone.
