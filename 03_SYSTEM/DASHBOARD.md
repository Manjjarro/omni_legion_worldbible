Hybrid mode: Obsidian for canon, Cursor for runtime compilation.

---
type: system
id: DASHBOARD
version: "2.6"
---

# Grimverse Studio Dashboard

## Build targets
- One canonical antihero protagonist
- One main antagonist faction
- One stable visual language
- One arc at a time
- One winner per shot selection

## Canon overview
- Series: Grimverse
- Current protagonist: Ren
- Main arc: Genesis Pulse
- Core theme: survival with cost

## Live indexes

### Arcs
```dataview
TABLE theme, protagonist_start, protagonist_end, core_question
FROM "01_NODES/arcs"
SORT file.name ASC
```

### Episodes
```dataview
TABLE arc, episode_number, status, title
FROM "01_NODES/episodes"
SORT episode_number ASC
```

### Scenes
```dataview
TABLE sequence, episode, status, goal, conflict
FROM "01_NODES/scenes"
SORT sequence ASC
```

### Shots
```dataview
TABLE scene, shot_number, status, duration_seconds, camera
FROM "01_NODES/shots"
SORT shot_number ASC
```

### Characters
```dataview
TABLE tier, status, weapon, file.link
FROM "01_NODES/characters"
SORT tier ASC
```

### Review summary
```dataview
TABLE review_type, final_score, verdict, promote_to_winner
FROM "02_PRODUCTION/review_logs"
SORT reviewed_date DESC
```
