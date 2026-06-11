---
type: system
id: CURSOR_RUNTIME
version: '4.3'
---

# Cursor Runtime Notes

Use Cursor when you need to turn canon into production output.

## Typical commands
- Compile SHOT_001 package
- Generate thumbnail prompt for SHOT_001
- Validate EP_001
- Propagate state from EVENT_001
- Build episode package for EP_002

## Output discipline
- Short final prompt
- Stable negative prompt
- Separate thumbnail prompt
- Separate continuity checklist
- Separate state delta when canon changes

## Storage discipline
- Obsidian stores truth
- Cursor stores execution output
- Production logs store the generated assets


## Node resolution rule
Resolve nodes by frontmatter `id` first, then filename stem, then aliases. Do not assume the linked text equals the file name.
