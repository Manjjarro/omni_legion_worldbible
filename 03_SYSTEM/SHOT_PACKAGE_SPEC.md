---
type: system
id: SHOT_PACKAGE_SPEC
version: '4.3'
---

# Shot Package Spec

Every shot package produced by Cursor should have this structure:

## Required outputs
1. `final_image_prompt.md`
2. `negative_prompt.md`
3. `final_video_prompt.md`
4. `thumbnail_prompt.md`
5. `continuity_checklist.md`
6. `state_delta.md` when canon changes
7. `failure_log.md` when a run fails

## Folder shape
`02_PRODUCTION/packages/EP_001/SCENE_001/SHOT_001/`

## Logging rules
- Save the run outputs immediately after generation
- Tag the winner asset clearly
- Write the image source and video source back into the shot note
- Update the scene note after all its shots finish
- Update the episode note after all scenes finish
- If a state change occurred, write the delta before moving on

## Short prompt rule
The copied prompt should be visual only:
- character appearance
- wardrobe
- expression
- environment
- lighting
- camera
- motion
- style

Do not copy:
- world explanation
- event history
- story summary
- review commentary
- canon reasoning

Those remain in Obsidian and in the package logs.
