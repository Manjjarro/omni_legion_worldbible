# 📊 OMNI MASTER DASHBOARD

## Active Scenes

```dataview
TABLE
sequence,
status,
storyboard_status,
continuity_score

FROM "01_NODES/scenes"

SORT sequence ASC
```

---

## Failures

```dataview
TABLE
type,
failures,
stability

FROM "01_NODES"

WHERE
failures>0
OR
stability<1

SORT failures DESC
```